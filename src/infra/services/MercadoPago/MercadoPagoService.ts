import { MercadoPagoConfig, Payment } from 'mercadopago';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

export class MercadoPagoService {
  private client: MercadoPagoConfig;
  private isProd = process.env.ENV === 'PROD';

  constructor(accessToken: string) {
    if (!accessToken) {
      throw new Error('Missing required configurations for MercadoPagoService.');
    }

    this.client = new MercadoPagoConfig({ accessToken });
  }

  async getPayment(id: string): Promise<PaymentResponse> {
    if (!this.isProd) return paymentMock;

    const payment = new Payment(this.client);
    const response = await payment.get({ id });

    console.log(`Mercadopago response from order ${id}: `, JSON.stringify(response, null, 2));

    if (
      response.api_response.status !== 200 ||
      !(response.transaction_amount && response.authorization_code && response.id)
    ) {
      console.error('Error looking for payment.', JSON.stringify(response, null, 2));
      throw new Error('Error looking for payment.');
    }

    return response;
  }
}

const paymentMock: PaymentResponse = {
  api_response: {
    headers: ['', []],
    status: 200,
  },
  transaction_amount: 20000,
  authorization_code: '123456',
  id: 123456,
  status: 'approved',
};
