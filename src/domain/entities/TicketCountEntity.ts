export interface TicketCountEntity {
  eventId: string;
  count: Count[];
}

export interface Count {
  type: string;
  count: number;
  used: number;
}
