import { EventBridgeEvent } from 'aws-lambda';

import { SendNFTUseCase } from '@useCases/SendNFT';
import { SendNFTDTO } from '@dtos/SendNFT';

type DetailTypes = 'SEND_NFT';

export class PaymentSQSController {
  constructor(private SendNFTUseCase: SendNFTUseCase) {}

  async dispatch(event: EventBridgeEvent<DetailTypes, SendNFTDTO>): Promise<{ statusCode: number; body: string }> {
    try {
      switch (event['detail-type']) {
        case 'SEND_NFT':
          await this.SendNFTUseCase.execute(event.detail);
          return { statusCode: 200, body: 'Ok' };

        default:
          return { statusCode: 200, body: 'Ok' };
      }
    } catch (error) {
      const err = error as Error;
      console.error('Error sending NFT:', err.message);
      return { statusCode: 404, body: JSON.stringify({ message: err.message }) };
    }
  }
}
