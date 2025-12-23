export interface ITicketService {
  generateId(collectionSymbol: string, eventEdition: number): string;
}
