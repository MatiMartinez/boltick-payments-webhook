import { ILogger } from "@commons/Logger/interface";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { TicketEntity } from "@domain/entities/TicketEntity";
import { TicketModel } from "@models/TicketModel";

export class TicketDynamoRepository implements ITicketRepository {
  constructor(private logger: ILogger) {}

  async save(ticket: TicketEntity): Promise<void> {
    try {
      await TicketModel.create(ticket);
    } catch (error) {
      this.logger.error("[TicketDynamoRepository.save] Error saving ticket:", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async findByTicketNumber(ticketNumber: string): Promise<TicketEntity | null> {
    try {
      const response = await TicketModel.query("ticketNumber")
        .eq(ticketNumber)
        .using("ticketNumberIndex")
        .exec();
      return (response[0] as unknown as TicketEntity) || null;
    } catch (error) {
      this.logger.error("[TicketDynamoRepository.findByTicketNumber] Error looking for ticket:", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async update(ticket: TicketEntity): Promise<void> {
    try {
      const { walletAddress, createdAt, ...rest } = ticket;
      await TicketModel.update({ walletAddress, createdAt }, rest);
    } catch (error) {
      this.logger.error("[TicketDynamoRepository.update] Error updating ticket:", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async findFreeTicketsByEventId(eventId: string): Promise<TicketEntity[]> {
    try {
      const response = await TicketModel.query("eventId").eq(eventId).using("eventIdIndex").exec();

      // Filtrar solo los tickets que son gratuitos (unitPrice === 0)
      const freeTickets = response.filter((ticket: any) => ticket.unitPrice === 0);

      return freeTickets.map((ticket: any) => ticket as TicketEntity);
    } catch (error) {
      this.logger.error(
        "[TicketDynamoRepository.findFreeTicketsByEventId] Error looking for free tickets:",
        {
          error: (error as Error).message,
          eventId,
        }
      );
      throw error;
    }
  }
}
