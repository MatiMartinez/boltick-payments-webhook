import { NFT, PaymentEntity } from "@domain/entities/PaymentEntity";

export interface IPaymentRepository {
  getPaymentById(id: string): Promise<PaymentEntity>;
  updatePayment(userId: string, createdAt: number, data: Pick<PaymentEntity, "updatedAt" | "paymentStatus" | "paymentDetails">): Promise<PaymentEntity>;
  updateNFT(userId: string, createdAt: number, updatedAt: number, index: number, toUpdate: NFT): Promise<PaymentEntity>;
}
