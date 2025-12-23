import { TicketEntity } from "@domain/entities/TicketEntity";

export interface PaginatedTicketsResult {
  tickets: TicketEntity[];
  lastKey?: any;
  hasMore: boolean;
}

export interface ITicketRepository {
  save(ticket: TicketEntity): Promise<void>;
  findByTicketNumber(ticketNumber: string): Promise<TicketEntity | null>;
  update(ticket: TicketEntity): Promise<void>;
  findTicketsByEventCategoryPaginated(eventIdCategoryIndex: string, limit?: number, lastKey?: any): Promise<PaginatedTicketsResult>;
}
