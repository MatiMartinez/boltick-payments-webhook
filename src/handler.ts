import { updatePaymentMercadopagoWebhook } from './routes/webhook-mercadopago';

export const handler = async (event: any, _context: any, callback: any) => {
  try {
    console.log('Evento: ', JSON.stringify(event, null, 2));

    const payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    console.log('Ingresa el siguiente payload: ', JSON.stringify(payload, null, 2));

    if (event.requestContext.http.path === '/api/webhook-mercadopago' && event.requestContext.http.method === 'POST') {
      const response = await updatePaymentMercadopagoWebhook(payload);
      if (!response) throw new Error('Error updating payment.');
      callback(null, { statusCode: 200, body: JSON.stringify(response) });
    }

    callback(null, { statusCode: 200, body: 'Ok' });
  } catch (error) {
    const err = error as Error;
    console.log('Ocurrio un error general: ', JSON.stringify(err, null, 2));

    callback(null, { statusCode: 400, body: JSON.stringify(err.message) });
  }
};
