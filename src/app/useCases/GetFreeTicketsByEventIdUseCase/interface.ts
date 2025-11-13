export interface IGetFreeTicketsByEventIdUseCase {
  execute(eventId: string): Promise<GetFreeTicketsByEventIdOutput>;
}

export interface GetFreeTicketsByEventIdOutput {
  result: number;
  message: string;
  data?: {
    tickets: FreeTicketInfo[];
    total: number;
  };
}

export interface FreeTicketInfo {
  ticketNumber: string;
  type: string;
  walletAddress: string;
  assetId: string;
  metadataUrl: string;
  imageUrl: string;
  collectionName: string;
  collectionSymbol: string;
  createdAt: number;
  used: number;
  useDate: number;
  eventName: string;
}
