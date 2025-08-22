import { TicketModel } from "@models/TicketModel";
import { TicketEntity } from "@domain/entities/TicketEntity";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { ILogger } from "@commons/Logger/interface";

export class TicketDynamoRepository implements ITicketRepository {
  constructor(private logger: ILogger) {}

  async save(ticket: TicketEntity): Promise<void> {
    try {
      await TicketModel.create(ticket);
    } catch (error) {
      this.logger.error("[TicketDynamoRepository.save] Error saving ticket:", { error: (error as Error).message });
      throw error;
    }
  }

  async findByTicketNumber(ticketNumber: string): Promise<TicketEntity | null> {
    try {
      const response = await TicketModel.query("ticketNumber").eq(ticketNumber).using("ticketNumberIndex").exec();
      return (response[0] as unknown as TicketEntity) || null;
    } catch (error) {
      this.logger.error("[TicketDynamoRepository.findByTicketNumber] Error looking for ticket:", { error: (error as Error).message });
      throw error;
    }
  }

  async update(ticket: TicketEntity): Promise<void> {
    try {
      const { walletAddress, createdAt, ...rest } = ticket;
      await TicketModel.update({ walletAddress, createdAt }, rest);
    } catch (error) {
      this.logger.error("[TicketDynamoRepository.update] Error updating ticket:", { error: (error as Error).message });
      throw error;
    }
  }
}
