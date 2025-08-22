import { TicketCountModel } from "@models/TicketCountModel";
import { ITicketCountRepository } from "@domain/repositories/TicketCountRepository";
import { Count } from "@domain/entities/TicketCountEntity";
import { ILogger } from "@commons/Logger/interface";

export class TicketCountDynamoRepository implements ITicketCountRepository {
  constructor(private Logger: ILogger) {}

  async getTicketCount(eventId: string) {
    try {
      return await TicketCountModel.get({ eventId });
    } catch (error) {
      this.Logger.error("[TicketCountDynamoRepository] Error al obtener el ticket count", { error: (error as Error).message });
      throw error;
    }
  }

  async updateTicketCount(eventId: string, newCount: Count[]) {
    try {
      await TicketCountModel.update({ eventId }, { count: newCount });
    } catch (error) {
      this.Logger.error("[TicketCountDynamoRepository] Error al actualizar el ticket count", { error: (error as Error).message });
      throw error;
    }
  }
}
