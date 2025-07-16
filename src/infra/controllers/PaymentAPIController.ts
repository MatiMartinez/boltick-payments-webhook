import { Request, Response } from "express";

import { UpdatePaymentUseCase } from "@useCases/UpdatePaymentUseCase/UpdatePaymentUseCase";

export class PaymentAPIController {
  constructor(private UpdatePaymentUseCase: UpdatePaymentUseCase) {}

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
}
