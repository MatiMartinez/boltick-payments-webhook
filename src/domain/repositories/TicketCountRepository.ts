export interface ITicketCountRepository {
  incrementCountByEventId(eventId: string, increment?: number): Promise<void>;
}
