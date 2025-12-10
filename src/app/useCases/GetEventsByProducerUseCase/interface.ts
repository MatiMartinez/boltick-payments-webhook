import { EventEntity } from "@domain/entities/EventEntity";

export interface IGetEventsByProducerUseCase {
  execute(producer: string): Promise<GetEventsByProducerOutput>;
}

export interface GetEventsByProducerOutput {
  success: number;
  message: string;
  data?: EventEntity[];
}
