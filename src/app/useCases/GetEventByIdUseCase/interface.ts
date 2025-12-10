import { EventEntity } from "@domain/entities/EventEntity";

export interface IGetEventByIdUseCase {
  execute(id: string): Promise<GetEventByIdOutput>;
}

export interface GetEventByIdOutput {
  success: number;
  message: string;
  data?: EventEntity;
}
