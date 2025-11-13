import { Request, Response } from "express";
import { IGetPRsByProducerUseCase } from "@useCases/GetPRsByProducerUseCase/interface";
import { ICreatePRUseCase } from "@useCases/CreatePRUseCase/interface";
import { IUpdatePRUseCase } from "@useCases/UpdatePRUseCase/interface";

export class PRController {
  constructor(
    private GetPRsByProducerUseCase: IGetPRsByProducerUseCase,
    private CreatePRUseCase: ICreatePRUseCase,
    private UpdatePRUseCase: IUpdatePRUseCase
  ) {}

  async CreatePR(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.CreatePRUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      const err = error as Error;
      console.error("Error creating PR:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async GetPRsByProducer(req: Request, res: Response): Promise<void> {
    try {
      const producer = req.params.producer as string;
      const result = await this.GetPRsByProducerUseCase.execute(producer);
      res.status(200).json(result);
    } catch (error) {
      const err = error as Error;
      console.error("Error getting PRs by producer:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async UpdatePR(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.UpdatePRUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      const err = error as Error;
      console.error("Error updating PR:", err.message);
      res.status(400).json({ error: err.message });
    }
  }
}
