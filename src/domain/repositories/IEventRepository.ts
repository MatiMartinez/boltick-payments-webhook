import { EventEntity } from "@domain/entities/EventEntity";

export interface IEventRepository {
  findById(id: string): Promise<EventEntity | null>;
}
