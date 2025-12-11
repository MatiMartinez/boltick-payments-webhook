import { IUpdateEventUseCase, UpdateEventInput, UpdateEventOutput } from "./interface";
import { IEventRepository } from "@domain/repositories/IEventRepository";
import { ILogger } from "@commons/Logger/interface";

export class UpdateEventUseCase implements IUpdateEventUseCase {
  constructor(
    private EventRepository: IEventRepository,
    private Logger: ILogger
  ) {}

  async execute(input: UpdateEventInput): Promise<UpdateEventOutput> {
    try {
      const { id, ...updateData } = input;

      if (!id || id.trim() === "") {
        return { success: 0, message: "EventId no proporcionado" };
      }

      const updatedEvent = await this.EventRepository.update(id, updateData);
      return { success: 1, message: "Evento actualizado correctamente", data: updatedEvent };
    } catch (error) {
      this.Logger.error("[UpdateEventUseCase] Error al actualizar el evento", { error: (error as Error).message });
      return { success: 0, message: "Error al actualizar el evento" };
    }
  }
}
