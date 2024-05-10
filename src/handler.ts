import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { PaymentDynamoRepository } from './infra/repository/payment/payment.dynamo.repository';
import { Status } from './domain/payment/payment.entity';
import { SnsService } from './infra/service/sns/sns.service';
import { MercadoPagoService } from './infra/service/mercadopago/mercadopago.service';
import { PaymentVO } from './domain/payment/payment.vo';
import { formatARS, generateDateDDMMYYYYHHMM } from './infra/utils/date';

export const handler = async (event: APIGatewayProxyEvent, _context: any, callback: any) => {
  try {
    console.log('Event: ', JSON.stringify(event, null, 2));

    if (!event.body) return { statusCode: 404, body: 'The request body is empty.' };

    const payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    const dynamoClient = new DynamoDBClient({
      region: 'us-east-1',
    });

    const paymentRepository = new PaymentDynamoRepository(dynamoClient);

    if (event.path === '/api/update-payment-callback' && event.httpMethod === 'POST') {
      const { id, status } = payload as { id: string; status: Status };

      console.log(`Callback - ${id} - Request body: `, JSON.stringify(payload, null, 2));

      const response = await paymentRepository.updatePaymentCallbackStatus(id, status);

      if (!response) {
        console.log(`Callback - ${id} - Failed update response: `, JSON.stringify(response, null, 2));
        callback(null, { statusCode: 404, body: 'Error updating payment.' });
      }

      console.log(`Callback - ${id} - Updated response: `, JSON.stringify(response, null, 2));
      callback(null, { statusCode: 200, body: 'Payment successfully updated.' });
    }

    if (event.path === '/api/update-payment-webhook' && event.httpMethod === 'POST') {
      const { id } = payload as { id: string; topic: string };

      console.log(`Webhook - ${id} - Request body: `, JSON.stringify(payload, null, 2));

      const mercadopagoService = new MercadoPagoService();
      const mercadopago_response = await mercadopagoService.getPayment(id);
      console.log(`Webhook - ${id} - Mercado Pago payment response: `, JSON.stringify(mercadopago_response, null, 2));

      const updated_payment_vo = new PaymentVO().updatePayment(id, mercadopago_response);
      const response = await paymentRepository.updatePayment(updated_payment_vo);
      if (!response) {
        console.log(`Webhook - ${id} - Failed update response: `, JSON.stringify(response, null, 2));
        callback(null, { statusCode: 404, body: 'Error updating payment.' });
      }

      if (mercadopago_response.status === 'approved') {
        const sesClient = new SnsService();

        await sesClient.sendPaymentConfirmation({
          amount: formatARS.format(mercadopago_response.transaction_amount),
          id: updated_payment_vo.id,
          transaction_code: mercadopago_response.authorization_code,
          transaction_date: generateDateDDMMYYYYHHMM(new Date()),
          user: 'administrador@boltick.com.ar',
        });
      }

      console.log(`Webhook - ${id} - Updated response: `, JSON.stringify(response, null, 2));
      callback(null, { statusCode: 200, body: 'Updated payment.' });
    }

    callback(null, {
      statusCode: 404,
      body: 'Route not found.',
    });
  } catch (error) {
    console.log('Ocurrio un error general: ', JSON.stringify(error, null, 2));

    callback(null, {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify(error),
    });
  }
};
