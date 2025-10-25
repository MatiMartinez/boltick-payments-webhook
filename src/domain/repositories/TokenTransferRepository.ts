import { TokenTransferEntity } from "@domain/entities/TokenTransferEntity";

export interface ITokenTransferRepository {
  create(transfer: TokenTransferEntity): Promise<TokenTransferEntity>;
  getById(id: string): Promise<TokenTransferEntity>;
  update(
    walletAddress: string,
    createdAt: number,
    data: TokenTransferUpdateData
  ): Promise<TokenTransferEntity>;
}

export type TokenTransferUpdateData = Partial<
  Pick<TokenTransferEntity, "nftAddress" | "updatedAt" | "transactionHash" | "transactionStatus">
>;
