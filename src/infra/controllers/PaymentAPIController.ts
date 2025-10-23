import { Request, Response } from "express";
import { IUpdatePaymentUseCase } from "@useCases/UpdatePaymentUseCase/interface";
import { IUpdateFreePaymentUseCase } from "@useCases/UpdateFreePaymentUseCase/interface";
import { IUpdateTokenPaymentUseCase } from "@useCases/UpdateTokenPaymentUseCase/interface";

export class PaymentAPIController {
  constructor(
    private UpdatePaymentUseCase: IUpdatePaymentUseCase,
    private UpdateFreePaymentUseCase: IUpdateFreePaymentUseCase,
    private UpdateTokenPaymentUseCase: IUpdateTokenPaymentUseCase
  ) {}

  async UpdatePayment(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.UpdatePaymentUseCase.execute(req.body);
      res.status(200).json({ payment: result });
    } catch (error) {
      const err = error as Error;
      console.error("Error updating payment from webhook:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async UpdateFreePayment(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.UpdateFreePaymentUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      const err = error as Error;
      console.error("Error updating free payment:", err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async UpdateTokenPayment(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.UpdateTokenPaymentUseCase.execute(req.body);
      res.status(200).json({ payment: result });
    } catch (error) {
      const err = error as Error;
      console.error("Error updating token payment from webhook:", err.message);
      res.status(400).json({ error: err.message });
    }
  }
}
