import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";

export interface IMercadoPagoService {
  getPayment(id: string): Promise<PaymentResponse>;
}
