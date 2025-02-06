import { PaymentModel } from '@models/Payment';
import { Payment } from '@domain/Payment';

export class PaymentRepository {
  async getPaymentById(id: string): Promise<Payment> {
    const response = await PaymentModel.query('id').eq(id).using('idIndex').exec();
    return response[0];
  }

  async updatePayment(
    userId: string,
    createdAt: number,
    toUpdate: Pick<Payment, 'updatedAt' | 'paymentStatus' | 'paymentDetails'>
  ): Promise<Payment> {
    return await PaymentModel.update({ userId, createdAt }, toUpdate);
  }

  async updateNFT(userId: string, createdAt: number, toUpdate: Pick<Payment, 'updatedAt' | 'nfts'>): Promise<Payment> {
    return await PaymentModel.update({ userId, createdAt }, toUpdate);
  }
}
