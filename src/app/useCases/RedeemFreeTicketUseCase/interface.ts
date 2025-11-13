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
  success: boolean;
  ticket?: {
    ticketNumber: string;
    mint: string;
    metadataUrl: string;
    type: string;
  };
  message: string;
}
