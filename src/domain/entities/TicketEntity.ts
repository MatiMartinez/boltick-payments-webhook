export interface TicketEntity {
  ticketNumber: string;
  type: string;
  unitPrice: number;
  imageUrl: string;
  metadataUrl: string;

  eventId: string;
  eventName: string;
  prName: string;

  walletAddress: string;
  assetId: string;
  collectionName: string;
  collectionSymbol: string;

  createdAt: number;
  used: number;
  useDate: number;
}
