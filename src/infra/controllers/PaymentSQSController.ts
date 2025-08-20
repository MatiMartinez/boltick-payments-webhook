import { EventBridgeEvent } from "aws-lambda";
import { ISendNFTUseCase, SendNFTInput } from "@useCases/SendNFTUseCase/interface";

type DetailTypes = "SEND_NFT";

export class PaymentSQSController {
  constructor(private SendNFTUseCase: ISendNFTUseCase) {}

  async dispatch(event: EventBridgeEvent<DetailTypes, SendNFTInput>): Promise<{ statusCode: number; body: string }> {
    try {
      switch (event["detail-type"]) {
        case "SEND_NFT":
          await this.SendNFTUseCase.execute(event.detail);
          return { statusCode: 200, body: "Ok" };

        default:
          return { statusCode: 200, body: "Ok" };
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error sending NFT:", err.message);
      throw new Error(err.message);
    }
  }
}
