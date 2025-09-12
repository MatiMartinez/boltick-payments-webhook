import { Request, Response } from "express";
import { IValidateEntryUseCase } from "@useCases/ValidateEntryUseCase/interface";
import { IValidateManualEntryUseCase } from "@useCases/ValidateManualEntryUseCase/interface";
import { IGetTicketCountByEventIdUseCase } from "@useCases/GetTicketCountByEventIdUseCase/interface";

export class TicketController {
  constructor(
    private ValidateEntryUseCase: IValidateEntryUseCase,
    private ValidateManualEntryUseCase: IValidateManualEntryUseCase,
    private GetTicketCountByEventIdUseCase: IGetTicketCountByEventIdUseCase
  ) {}

  async ValidateEntry(req: Request, res: Response): Promise<void> {
    try {
      const token = req.body.token as string;
      const result = await this.ValidateEntryUseCase.execute({ token });
      res.status(200).json(result);
    } catch (error) {
      const err = error as Error;
      console.error("Error validating entry:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async ValidateManualEntry(req: Request, res: Response): Promise<void> {
    try {
      const ticketNumber = req.body.ticketNumber as string;
      const result = await this.ValidateManualEntryUseCase.execute({ ticketNumber });
      res.status(200).json(result);
    } catch (error) {
      const err = error as Error;
      console.error("Error validating manual entry:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async GetTicketCountByEventId(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.id as string;
      const result = await this.GetTicketCountByEventIdUseCase.execute(eventId);
      res.status(200).json(result);
    } catch (error) {
      const err = error as Error;
      console.error("Error getting ticket count by event id:", err.message);
      res.status(400).json({ error: err.message });
    }
  }
}
