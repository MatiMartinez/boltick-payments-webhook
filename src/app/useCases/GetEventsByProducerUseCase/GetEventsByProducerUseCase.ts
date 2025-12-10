import { IGetEventsByProducerUseCase, GetEventsByProducerOutput } from "./interface";
import { IEventRepository } from "@domain/repositories/IEventRepository";
import { ILogger } from "@commons/Logger/interface";

export class GetEventsByProducerUseCase implements IGetEventsByProducerUseCase {
  constructor(
    private EventRepository: IEventRepository,
    private Logger: ILogger
  ) {}

  async execute(producer: string): Promise<GetEventsByProducerOutput> {
    try {
      if (!producer || producer.trim() === "") {
        return { success: 0, message: "Productora no proporcionada" };
      }

      const events = await this.EventRepository.findByProducer(producer);
      return { success: 1, message: "Eventos obtenidos correctamente", data: events };
    } catch (error) {
      this.Logger.error("[GetEventsByProducerUseCase] Error al obtener los eventos", { error: (error as Error).message });
      return { success: 0, message: "Error al obtener los eventos" };
    }
  }
}
