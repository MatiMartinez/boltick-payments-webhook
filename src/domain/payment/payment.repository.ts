import { PaymentEntity, Status } from './payment.entity';

export interface PaymentRepository {
  updatePaymentCallbackStatus: (id: string, status: Status) => Promise<PaymentEntity>;
  updatePayment: (
    payload: Omit<PaymentEntity, 'date' | 'items' | 'provider' | 'used' | 'user'>
  ) => Promise<PaymentEntity>;
}
