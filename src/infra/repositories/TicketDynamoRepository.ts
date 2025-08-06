import { TicketModel } from "@models/TicketModel";
import { TicketEntity } from "@domain/entities/TicketEntity";
import { ITicketRepository } from "@domain/repositories/TicketRepository";

export class TicketDynamoRepository implements ITicketRepository {
  async save(ticket: TicketEntity): Promise<void> {
    try {
      await TicketModel.create(ticket);
    } catch (error) {
      console.error("[TicketDynamoRepository.save] Error saving ticket:", error);
      throw error;
    }
  }

  async findByTicketNumber(ticketNumber: string): Promise<TicketEntity | null> {
    try {
      const response = await TicketModel.query("ticketNumber").eq(ticketNumber).using("ticketNumberIndex").exec();
      return (response[0] as unknown as TicketEntity) || null;
    } catch (error) {
      console.error("[TicketDynamoRepository.findByTicketNumber] Error looking for ticket:", error);
      throw error;
    }
  }

  async update(ticket: TicketEntity): Promise<void> {
    try {
      const { walletAddress, createdAt, ...rest } = ticket;
      await TicketModel.update({ walletAddress, createdAt }, rest);
    } catch (error) {
      console.error("[TicketDynamoRepository.update] Error updating ticket:", error);
      throw error;
    }
  }
}
