import { IGetTicketCountByEventIdUseCase, IGetTicketCountByEventIdUseCaseOutput } from "./interface";
import { ITicketCountRepository } from "@domain/repositories/TicketCountRepository";
import { ILogger } from "@commons/Logger/interface";

export class GetTicketCountByEventIdUseCase implements IGetTicketCountByEventIdUseCase {
  constructor(
    private ticketCountRepository: ITicketCountRepository,
    private logger: ILogger
  ) {}

  public async execute(input: string): Promise<IGetTicketCountByEventIdUseCaseOutput> {
    try {
      if (!input || input.trim() === "") {
        return { result: 0, message: "EventId no proporcionado" };
      }

      const ticketCount = await this.ticketCountRepository.getTicketCount(input);

      if (!ticketCount) {
        return { result: 0, message: "No se encontró información de tickets para este evento" };
      }

      return {
        result: 1,
        message: "Ticket count obtenido exitosamente",
        data: {
          eventId: ticketCount.eventId,
          count: ticketCount.count,
        },
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.logger.error("[GetTicketCountByEventIdUseCase] Error al obtener ticket count", {
        eventId: input,
        error: errorMessage,
      });
      return { result: 0, message: `Error al obtener ticket count: ${errorMessage}` };
    }
  }
}
