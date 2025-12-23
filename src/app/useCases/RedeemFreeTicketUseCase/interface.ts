export interface IRedeemFreeTicketUseCase {
  execute(input: RedeemFreeTicketInput): Promise<RedeemFreeTicketOutput>;
}

export interface RedeemFreeTicketInput {
  eventId: string;
  ticketType: string;
  walletPublicKey: string;
  userId: string;
}

export interface RedeemFreeTicketOutput {
  success: number;
  message: string;
  data?: {
    ticketNumber: string;
    type: string;
  };
}
