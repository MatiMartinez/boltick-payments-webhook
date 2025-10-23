import { TokenPaymentEntity } from "@domain/entities/TokenPaymentEntity";

export interface ITokenPaymentRepository {
  getPaymentById(id: string): Promise<TokenPaymentEntity>;
  updatePayment(
    userId: string,
    createdAt: number,
    data: Pick<TokenPaymentEntity, "updatedAt" | "paymentStatus" | "paymentDetails">
  ): Promise<TokenPaymentEntity>;
  updateTokensSent(userId: string, createdAt: number, data: Pick<TokenPaymentEntity, "updatedAt" | "tokensSent">): Promise<TokenPaymentEntity>;
}
