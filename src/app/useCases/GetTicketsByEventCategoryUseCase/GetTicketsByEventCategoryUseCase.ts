import { IGetTicketsByEventCategoryUseCase, GetTicketsByEventCategoryInput, GetTicketsByEventCategoryOutput } from "./interface";
import { ITicketRepository } from "@domain/repositories/TicketRepository";
import { ILogger } from "@commons/Logger/interface";

export class GetTicketsByEventCategoryUseCase implements IGetTicketsByEventCategoryUseCase {
  constructor(
    private TicketRepository: ITicketRepository,
    private Logger: ILogger
  ) {}

  async execute(input: GetTicketsByEventCategoryInput): Promise<GetTicketsByEventCategoryOutput> {
    const eventIdCategoryIndex = `${input.eventId}#${input.category}`;

    const result = await this.TicketRepository.findTicketsByEventCategoryPaginated(eventIdCategoryIndex, input.limit, input.lastKey);

    return {
      success: 1,
      message: "Tickets obtenidos exitosamente",
      data: {
        tickets: result.tickets,
        lastKey: result.lastKey,
        hasMore: result.hasMore,
        total: result.tickets.length,
      },
    };
  }
}
