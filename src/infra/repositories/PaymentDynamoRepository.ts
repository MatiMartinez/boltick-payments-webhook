import { PaymentModel } from "@models/PaymentModel";
import { NFT, PaymentEntity } from "@domain/entities/PaymentEntity";
import { IPaymentRepository } from "@domain/repositories/PaymentRepository";
import { ILogger } from "@commons/Logger/interface";

export class PaymentDynamoRepository implements IPaymentRepository {
  constructor(private logger: ILogger) {}

  async getPaymentById(id: string) {
    const response = await PaymentModel.query("id").eq(id).using("idIndex").exec();
    return response[0] as unknown as PaymentEntity;
  }

  async updatePayment(userId: string, createdAt: number, toUpdate: Pick<PaymentEntity, "updatedAt" | "paymentStatus" | "paymentDetails">) {
    return await PaymentModel.update({ userId, createdAt }, toUpdate);
  }

  async updateNFT(userId: string, createdAt: number, updatedAt: number, index: number, toUpdate: NFT) {
    try {
      const updatedPayment = await PaymentModel.update({ userId, createdAt }, { $SET: { [`nfts.${index}`]: toUpdate, updatedAt } });
      return updatedPayment as PaymentEntity;
    } catch (error) {
      this.logger.error("[PaymentDynamoRepository] Error al actualizar el NFT", { error: (error as Error).message });
      throw error;
    }
  }
}
