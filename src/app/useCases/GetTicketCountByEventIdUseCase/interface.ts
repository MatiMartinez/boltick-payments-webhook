import { TicketCountEntity } from "@domain/entities/TicketCountEntity";

export interface IGetTicketCountByEventIdUseCase {
  execute(input: IGetTicketCountByEventIdUseCaseInput): Promise<IGetTicketCountByEventIdUseCaseOutput>;
}

export interface IGetTicketCountByEventIdUseCaseInput {
  eventId: string;
}

export interface IGetTicketCountByEventIdUseCaseOutput {
  result: number;
  message: string;
  data?: TicketCountEntity;
}
