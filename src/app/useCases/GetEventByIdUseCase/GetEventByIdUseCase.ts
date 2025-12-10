import { IGetEventByIdUseCase, GetEventByIdOutput } from "./interface";
import { IEventRepository } from "@domain/repositories/IEventRepository";
import { ILogger } from "@commons/Logger/interface";

export class GetEventByIdUseCase implements IGetEventByIdUseCase {
  constructor(
    private EventRepository: IEventRepository,
    private Logger: ILogger
  ) {}

  async execute(id: string): Promise<GetEventByIdOutput> {
    try {
      if (!id || id.trim() === "") {
        return { success: 0, message: "EventId no proporcionado" };
      }

      const event = await this.EventRepository.findById(id);

      if (!event) {
        return { success: 0, message: "No se encontró el evento con el id proporcionado" };
      }

      return { success: 1, message: "Evento obtenido correctamente", data: event };
    } catch (error) {
      this.Logger.error("[GetEventByIdUseCase] Error al obtener el evento", { error: (error as Error).message });
      return { success: 0, message: "Error al obtener el evento" };
    }
  }
}
