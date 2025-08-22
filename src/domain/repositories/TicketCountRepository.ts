import { Count, TicketCountEntity } from "@domain/entities/TicketCountEntity";

export interface ITicketCountRepository {
  getTicketCount(eventId: string): Promise<TicketCountEntity>;
  updateTicketCount(eventId: string, newCount: Count[]): Promise<void>;
}
