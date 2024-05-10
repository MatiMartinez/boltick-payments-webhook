export interface TicketEntity {
  code: string;
  createdAt: number;
  id: string;
  payment_id: string;
  type: string;
  updatedAt?: number;
  used: boolean;
}
