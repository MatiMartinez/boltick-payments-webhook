import { Request, Response } from "express";
import { IInvalidarCloudFrontUseCase } from "@useCases/InvalidarCloudFrontUseCase/interface";

export class CloudFrontController {
  constructor(private InvalidarCloudFrontUseCase: IInvalidarCloudFrontUseCase) {}

  async InvalidateAll(req: Request, res: Response): Promise<void> {
    try {
      const { distributionId } = req.body;

      const result = await this.InvalidarCloudFrontUseCase.execute({ distributionId });

      if (result.success === 0) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      const err = error as Error;
      console.error("Error invalidando CloudFront:", err.message);
      res.status(500).json({ success: 0, message: err.message });
    }
  }
}
