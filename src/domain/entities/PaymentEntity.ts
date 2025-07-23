export interface PaymentEntity {
  id: string;
  callbackStatus: Status;
  createdAt: number;
  eventId: string;
  eventName: string;
  nfts: NFT[];
  paymentDetails?: PaymentDetails;
  paymentStatus: Status;
  prName: string;
  provider: Provider;
  updatedAt: number;
  userId: string;
  walletPublicKey: string;
}

export interface NFT {
  id: string;
  collectionName: string;
  collectionSymbol: string;
  imageUrl: string;
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
