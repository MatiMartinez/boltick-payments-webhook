import { TicketEntity } from './ticket.entity';

export interface TicketRepository {
  createTickets: (tickets: TicketEntity[]) => Promise<TicketEntity[]>;
}
