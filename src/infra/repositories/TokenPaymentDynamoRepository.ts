import { TokenPaymentModel } from "@models/TokenPaymentModel";
import { TokenPaymentEntity } from "@domain/entities/TokenPaymentEntity";
import { ITokenPaymentRepository } from "@domain/repositories/TokenPaymentRepository";
import { ILogger } from "@commons/Logger/interface";

export class TokenPaymentDynamoRepository implements ITokenPaymentRepository {
  constructor(private Logger: ILogger) {}

  async getPaymentById(id: string) {
    try {
      const response = await TokenPaymentModel.query("id").eq(id).using("idIndex").exec();
      return response[0] as unknown as TokenPaymentEntity;
    } catch (error) {
      this.Logger.error("[TokenPaymentDynamoRepository] Error al obtener el pago", { error: (error as Error).message });
      throw error;
    }
  }

  async updatePayment(userId: string, createdAt: number, toUpdate: Pick<TokenPaymentEntity, "updatedAt" | "paymentStatus" | "paymentDetails">) {
    try {
      return await TokenPaymentModel.update({ userId, createdAt }, toUpdate);
    } catch (error) {
      this.Logger.error("[TokenPaymentDynamoRepository] Error al actualizar el pago", { error: (error as Error).message });
      throw error;
    }
  }

  async updateTokensSent(userId: string, createdAt: number, toUpdate: Pick<TokenPaymentEntity, "updatedAt" | "tokensSent">) {
    try {
      return await TokenPaymentModel.update({ userId, createdAt }, toUpdate);
    } catch (error) {
      this.Logger.error("[TokenPaymentDynamoRepository] Error al actualizar el estado de tokens enviados", { error: (error as Error).message });
      throw error;
    }
  }
}
