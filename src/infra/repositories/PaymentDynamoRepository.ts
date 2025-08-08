import { PaymentModel } from "@models/PaymentModel";
import { PaymentEntity } from "@domain/entities/PaymentEntity";
import { IPaymentRepository } from "@domain/repositories/PaymentRepository";

export class PaymentDynamoRepository implements IPaymentRepository {
  async getPaymentById(id: string): Promise<PaymentEntity> {
    const response = await PaymentModel.query("id").eq(id).using("idIndex").exec();
    return response[0] as unknown as PaymentEntity;
  }

  async updatePayment(
    userId: string,
    createdAt: number,
    toUpdate: Pick<PaymentEntity, "updatedAt" | "paymentStatus" | "paymentDetails">
  ): Promise<PaymentEntity> {
    return await PaymentModel.update({ userId, createdAt }, toUpdate);
  }

  async updateNFT(userId: string, createdAt: number, toUpdate: Pick<PaymentEntity, "updatedAt" | "nfts">): Promise<PaymentEntity> {
    return await PaymentModel.update({ userId, createdAt }, toUpdate);
  }
}
