export interface ISnsService {
  sendPaymentConfirmation: (payload: PaymentConfirmationPayload) => Promise<void>;
}

export interface PaymentConfirmationPayload {
  amount: string;
  id: string;
  transaction_code: string;
  transaction_date: string;
  user: string;
}
