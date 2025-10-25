export interface TokenTransferEntity {
  id: string;
  createdAt: number;
  eventId: string;
  nftAddress: string;
  tokenAmount: number;
  tokenId: string;
  transactionHash: string;
  transactionStatus: TransactionStatus;
  updatedAt: number;
  walletAddress: string;
}

export type TransactionStatus = "Pending" | "Processing" | "Completed" | "Failed";
