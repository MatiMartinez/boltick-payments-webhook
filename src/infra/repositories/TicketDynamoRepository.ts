import { TicketModel } from "@models/TicketModel";
import { TicketEntity } from "@domain/entities/TicketEntity";
import { ITicketRepository } from "@domain/repositories/TicketRepository";

export class TicketDynamoRepository implements ITicketRepository {
  async save(ticket: TicketEntity): Promise<void> {
    await TicketModel.create(ticket);
  }

  async findByTicketNumber(ticketNumber: string): Promise<TicketEntity | null> {
    try {
      const response = await TicketModel.query("ticketNumber").eq(ticketNumber).using("ticketNumberIndex").exec();
      return (response[0] as unknown as TicketEntity) || null;
    } catch (error) {
      return null;
    }
  }
}
