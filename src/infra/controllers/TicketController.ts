import { Request, Response } from "express";

import { IValidateEntryUseCase } from "@useCases/ValidateEntryUseCase/interface";

export class TicketController {
  constructor(private ValidateEntryUseCase: IValidateEntryUseCase) {}

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
}
