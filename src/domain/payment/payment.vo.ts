import { PaymentEntity, Status } from './payment.entity';
import { PaymentResponse, MercadopagoStatus } from '../../infra/service/mercadopago/interface';

export class PaymentVO {
  updatePayment = (
    id: string,
    mercadopago_response: PaymentResponse
  ): Omit<PaymentEntity, 'createdAt' | 'items' | 'phone' | 'provider' | 'user' | 'callbackStatus'> => {
    const { status, transaction_amount, authorization_code, id: mercadopago_id } = mercadopago_response;

    return {
      id,
      payment: {
        amount: transaction_amount,
        code: authorization_code,
        id: mercadopago_id,
        updatedAt: new Date().getTime(),
      },
      status: this.paymentStatusDic(status),
    };
  };

  private paymentStatusDic = (mercadopago_status: MercadopagoStatus): Status => {
    if (mercadopago_status === 'approved') return 'Approved';
    if (mercadopago_status === 'authorized') return 'Pending';
    if (mercadopago_status === 'in_process') return 'Pending';
    if (mercadopago_status === 'pending') return 'Pending';
    return 'Rejected';
  };
}
