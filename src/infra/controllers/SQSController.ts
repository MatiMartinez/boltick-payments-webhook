import { EventBridgeEvent } from 'aws-lambda';

import { SendNFTUseCase } from '@useCases/SendNFT';
import { SendNFTDTO } from '@dtos/SendNFT';

export class PaymentController {
  constructor(private SendNFTUseCase: SendNFTUseCase) {}

  async SendNFT(event: EventBridgeEvent<'', SendNFTDTO>): Promise<{ statusCode: number; body: string }> {
    try {
      await this.SendNFTUseCase.execute(event.detail);
      return { statusCode: 200, body: 'Ok' };
    } catch (error) {
      const err = error as Error;
      console.error('Error sending NFT:', err.message);
      return { statusCode: 404, body: JSON.stringify({ message: err.message }) };
    }
  }
}
