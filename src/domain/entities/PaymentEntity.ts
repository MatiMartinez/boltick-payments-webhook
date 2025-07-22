export interface PaymentEntity {
  id: string;
  callbackStatus: Status;
  createdAt: number;
  eventId: string;
  nfts: NFT[];
  paymentDetails?: PaymentDetails;
  paymentStatus: Status;
  provider: Provider;
  updatedAt: number;
  userId: string;
  walletPublicKey: string;
  prName: string;
}

export interface NFT {
  id: string;
  collectionName: string;
  collectionSymbol: string;
  metadataUrl: string;
  mint: string;
  mintDate: number;
  ticketNumber: string;
  transactionId: string;
  type: string;
  unitPrice: number;
}

interface PaymentDetails {
  amount: number;
  code: string;
  id: string;
  updatedAt: number;
}

export type Status = "Pending" | "Approved" | "Rejected";
export type Provider = "Mercado Pago";
