import { TicketCountEntity } from "@domain/entities/TicketCountEntity";

export interface IGetTicketCountByEventIdUseCase {
  execute(input: string): Promise<IGetTicketCountByEventIdUseCaseOutput>;
}

export interface IGetTicketCountByEventIdUseCaseOutput {
  result: number;
  message: string;
  data?: TicketCountEntity;
}
