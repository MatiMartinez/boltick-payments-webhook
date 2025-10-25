import {
  ITokenTransferRepository,
  TokenTransferUpdateData,
} from "@domain/repositories/TokenTransferRepository";

import { ILogger } from "@commons/Logger/interface";
import { TokenTransferEntity } from "@domain/entities/TokenTransferEntity";
import { TokenTransferModel } from "@models/TokenTransferModel";

export class TokenTransferDynamoRepository implements ITokenTransferRepository {
  constructor(private Logger: ILogger) {}

  async create(transfer: TokenTransferEntity): Promise<TokenTransferEntity> {
    try {
      const result = await TokenTransferModel.create(transfer);
      return result as unknown as TokenTransferEntity;
    } catch (error) {
      this.Logger.error("[TokenTransferDynamoRepository] Error al crear la transferencia", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async getById(id: string): Promise<TokenTransferEntity> {
    try {
      const response = await TokenTransferModel.query("id").eq(id).using("idIndex").exec();
      return response[0] as unknown as TokenTransferEntity;
    } catch (error) {
      this.Logger.error("[TokenTransferDynamoRepository] Error al obtener la transferencia", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async update(
    walletAddress: string,
    createdAt: number,
    toUpdate: TokenTransferUpdateData
  ): Promise<TokenTransferEntity> {
    try {
      return await TokenTransferModel.update({ walletAddress, createdAt }, toUpdate);
    } catch (error) {
      this.Logger.error("[TokenTransferDynamoRepository] Error al actualizar la transferencia", {
        error: (error as Error).message,
      });
      throw error;
    }
  }
}
