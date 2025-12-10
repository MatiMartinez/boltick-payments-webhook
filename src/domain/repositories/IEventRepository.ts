import { EventEntity } from "@domain/entities/EventEntity";

export interface IEventRepository {
  findById(id: string): Promise<EventEntity | null>;
  findByProducer(producer: string): Promise<EventEntity[]>;
  update(id: string, createdAt: number, data: Partial<Omit<EventEntity, "id" | "createdAt">>): Promise<EventEntity>;
}
