import {
  FreeTicketInfo,
  GetFreeTicketsByEventIdOutput,
  IGetFreeTicketsByEventIdUseCase,
} from "./interface";

import { IEventRepository } from "@domain/repositories/IEventRepository";
import { ILogger } from "@commons/Logger/interface";
import { ITicketRepository } from "@domain/repositories/TicketRepository";

export class GetFreeTicketsByEventIdUseCase implements IGetFreeTicketsByEventIdUseCase {
  constructor(
    private TicketRepository: ITicketRepository,
    private EventRepository: IEventRepository,
    private Logger: ILogger
  ) {}

  async execute(eventId: string): Promise<GetFreeTicketsByEventIdOutput> {
    try {
      // Validar que el evento exista
      const event = await this.EventRepository.findById(eventId);
      if (!event) {
        this.Logger.error("[GetFreeTicketsByEventIdUseCase] Evento no encontrado:", { eventId });
        return {
          result: 0,
          message: "Evento no encontrado",
        };
      }

      // Obtener todos los tickets free del evento
      const freeTickets = await this.TicketRepository.findFreeTicketsByEventId(eventId);

      // Mapear a la estructura de respuesta
      const tickets: FreeTicketInfo[] = freeTickets.map((ticket) => ({
        ticketNumber: ticket.ticketNumber,
        type: ticket.type,
        walletAddress: ticket.walletAddress,
        assetId: ticket.assetId,
        metadataUrl: ticket.metadataUrl,
        imageUrl: ticket.imageUrl,
        collectionName: ticket.collectionName,
        collectionSymbol: ticket.collectionSymbol,
        createdAt: ticket.createdAt,
        used: ticket.used,
        useDate: ticket.useDate,
        eventName: ticket.eventName,
      }));

      // Ordenar por fecha de creación (más recientes primero)
      tickets.sort((a, b) => b.createdAt - a.createdAt);

      return {
        result: 1,
        data: {
          tickets,
          total: tickets.length,
        },
        message: "Tickets free obtenidos exitosamente",
      };
    } catch (error) {
      const err = error as Error;
      this.Logger.error("[GetFreeTicketsByEventIdUseCase] Error al obtener tickets free:", {
        error: err.message,
        eventId,
      });
      return {
        result: 0,
        message: "Error al obtener tickets free",
      };
    }
  }
}
