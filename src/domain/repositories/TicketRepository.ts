import { TicketEntity } from "@domain/entities/TicketEntity";

export interface ITicketRepository {
  save(ticket: TicketEntity): Promise<void>;
  findByTicketNumber(ticketNumber: string): Promise<TicketEntity | null>;
}
