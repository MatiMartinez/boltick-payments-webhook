export interface TokenPaymentEntity {
  id: string;
  createdAt: number;
  tokensSent: TokensSentStatus;
  paymentDetails?: PaymentDetails;
  paymentStatus: Status;
  provider: Provider;
  updatedAt: number;
  userId: string;
  walletPublicKey: string;
}

interface PaymentDetails {
  amount: number;
  code: string;
  id: string;
  updatedAt: number;
}

export type Status = "Pending" | "Approved" | "Rejected";
export type Provider = "Mercado Pago";
export type TokensSentStatus = "Pending" | "Sent" | "Failed";
