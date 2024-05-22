import { MercadoPagoConfig, Payment } from 'mercadopago';

import { PaymentEntity, Status } from '../../entities/payment.entity';

export const getPaymentStatus = async (id: string): Promise<Pick<PaymentEntity, 'id' | 'payment' | 'status'>> => {
  const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN as string });
  const payment = new Payment(client);

  const response = await payment.get({ id });
  console.log(`Mercadopago response from order ${id}: `, JSON.stringify(response, null, 2));

  if (
    response.api_response.status !== 200 ||
    !(response.transaction_amount && response.authorization_code && response.id)
  ) {
    console.log('Error looking for payment.', JSON.stringify(response, null, 2));
    throw new Error('Error looking for payment.');
  }

  return {
    id,
    payment: {
      amount: response.transaction_amount,
      code: response.authorization_code,
      id: response.id.toString(),
      updatedAt: new Date().getTime(),
    },
    status: generatePaymentStatus(response.status),
  };
};

const generatePaymentStatus = (mercadopago_status?: string): Status => {
  if (mercadopago_status === 'approved') return 'Approved';
  if (mercadopago_status === 'authorized') return 'Pending';
  if (mercadopago_status === 'in_process') return 'Pending';
  if (mercadopago_status === 'pending') return 'Pending';
  return 'Pending';
};
