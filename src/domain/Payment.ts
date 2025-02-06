export interface Payment {
  id: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
  eventId: string;
  nfts: NFT[];
  walletPublicKey: string;

  provider: Provider;
  callbackStatus: Status;
  paymentStatus: Status;
  paymentDetails?: PaymentDetails;
}

export interface NFT {
  id: string;
  collectionName: string;
  collectionSymbol: string;
  mint: string;
  mintDate: number;
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

export type Status = 'Pending' | 'Approved' | 'Rejected';
export type Provider = 'Mercado Pago';
