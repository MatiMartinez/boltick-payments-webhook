import { IEventRepository } from "@domain/repositories/IEventRepository";
import { EventEntity } from "@domain/entities/EventEntity";
import { EventModel } from "@models/EventModel";
import { ILogger } from "@commons/Logger/interface";

export class EventDynamoRepository implements IEventRepository {
  constructor(private logger: ILogger) {}

  async findById(id: string): Promise<EventEntity | null> {
    try {
      const event = await EventModel.get({ id });

      if (!event) {
        return null;
      }

      return event as EventEntity;
    } catch (error) {
      this.logger.error("[EventDynamoRepository] Error al buscar evento por id", { eventId: id, error: (error as Error).message });
      throw error;
    }
  }
}
