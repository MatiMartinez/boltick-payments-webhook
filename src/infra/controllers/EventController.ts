import { Request, Response } from "express";
import { IGetEventsByProducerUseCase } from "@useCases/GetEventsByProducerUseCase/interface";
import { IGetTicketCountByEventIdUseCase } from "@useCases/GetTicketCountByEventIdUseCase/interface";
import { IGetEventByIdUseCase } from "@useCases/GetEventByIdUseCase/interface";
import { IUpdateEventUseCase } from "@useCases/UpdateEventUseCase/interface";

export class EventController {
  constructor(
    private GetEventsByProducerUseCase: IGetEventsByProducerUseCase,
    private GetTicketCountByEventIdUseCase: IGetTicketCountByEventIdUseCase,
    private GetEventByIdUseCase: IGetEventByIdUseCase,
    private UpdateEventUseCase: IUpdateEventUseCase
  ) {}

  async GetEventsByProducer(req: Request, res: Response): Promise<void> {
    try {
      const producer = req.params.producer as string;
      const result = await this.GetEventsByProducerUseCase.execute(producer);
      if (result.success === 0) {
        res.status(400).json(result);
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error getting events by producer:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async GetTicketCountByEventId(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.eventId as string;
      const result = await this.GetTicketCountByEventIdUseCase.execute(eventId);
      if (result.result === 0) {
        res.status(404).json(result);
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error getting ticket count by event id:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async GetEventById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await this.GetEventByIdUseCase.execute(id);
      if (result.success === 0) {
        res.status(404).json(result);
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error getting event by id:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async UpdateEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await this.UpdateEventUseCase.execute({ id, ...req.body });
      if (result.success === 0) {
        res.status(400).json(result);
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error updating event:", err.message);
      res.status(400).json({ error: err.message });
    }
  }
}
