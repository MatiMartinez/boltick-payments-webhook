import { Request, Response } from 'express';

import { SendNFTUseCase } from '@useCases/SendNFT';
import { UpdatePaymentUseCase } from '@useCases/UpdatePayment';

export class PaymentController {
  constructor(
    private SendNFTUseCase: SendNFTUseCase,
    private UpdatePaymentUseCase: UpdatePaymentUseCase
  ) {}

  async SendNFT(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.SendNFTUseCase.execute(req.body);
      res.status(200).json({ url: result });
    } catch (error) {
      const err = error as Error;
      console.error('Error sending NFT:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async UpdatePayment(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.UpdatePaymentUseCase.execute(req.body);
      res.status(200).json({ payment: result });
    } catch (error) {
      const err = error as Error;
      console.error('Error updating payment from webhook:', err.message);
      res.status(400).json({ error: err.message });
    }
  }
}
