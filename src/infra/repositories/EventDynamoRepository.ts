import { IEventRepository } from "@domain/repositories/IEventRepository";
import { EventEntity } from "@domain/entities/EventEntity";
import { EventModel } from "@models/EventModel";
import { ILogger } from "@commons/Logger/interface";

export class EventDynamoRepository implements IEventRepository {
  constructor(private logger: ILogger) {}

  async findById(id: string) {
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

  async findByProducer(producer: string) {
    try {
      const response = await EventModel.query("producer").eq(producer).using("producerIndex").exec();
      return response as unknown as EventEntity[];
    } catch (error) {
      this.logger.error("[EventDynamoRepository] Error al buscar eventos por productora", { producer, error: (error as Error).message });
      throw error;
    }
  }

  async update(id: string, createdAt: number, data: Partial<Omit<EventEntity, "id" | "createdAt">>) {
    try {
      const updatedEvent = await EventModel.update({ id, createdAt }, data);
      return updatedEvent as EventEntity;
    } catch (error) {
      this.logger.error("[EventDynamoRepository] Error al actualizar evento", { eventId: id, error: (error as Error).message });
      throw error;
    }
  }
}
