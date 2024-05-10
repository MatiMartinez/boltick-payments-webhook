import { v4 as uuid } from 'uuid';

import { PaymentEntity } from '../payment/payment.entity';
import { TicketEntity } from './ticket.entity';

export class TicketVO {
  generateTickets = (payment: PaymentEntity): TicketEntity[] => {
    const { id, items } = payment;

    const aux_tickets: TicketEntity[] = [];
    const createdAt = new Date().getTime();

    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        aux_tickets.push({
          code: uuid(),
          createdAt,
          id: uuid(),
          payment_id: id,
          type: item.title,
          used: false,
        });
      }
    }

    return aux_tickets;
  };
}
