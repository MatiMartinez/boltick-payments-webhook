import { EventEntity } from "@domain/entities/EventEntity";

export interface IUpdateEventUseCase {
  execute(input: UpdateEventInput): Promise<UpdateEventOutput>;
}

export type UpdateEventInput = {
  id: string;
} & Partial<Omit<EventEntity, "id" | "createdAt">>;

export interface UpdateEventOutput {
  success: number;
  message: string;
  data?: EventEntity;
}
