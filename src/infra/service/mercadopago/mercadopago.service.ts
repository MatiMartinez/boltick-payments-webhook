import { MercadoPagoConfig, Payment } from 'mercadopago';

import { IMercadoPagoService, PaymentResponse } from './interface';

export class MercadoPagoService implements IMercadoPagoService {
  private client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN as string,
  });
  private payment = new Payment(this.client);

  getPayment = async (id: string) => {
    const response = await this.payment.get({ id });

    console.log(`Respuesta de Mercadopago para ${id}: `, JSON.stringify(response, null, 2));

    if (response.api_response.status !== 200) {
      throw new Error();
    }

    return response as unknown as PaymentResponse;
  };
}
