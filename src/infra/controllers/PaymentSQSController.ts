import { ILogger } from "@commons/Logger/interface";
import { ISendNFTUseCase } from "@useCases/SendNFTUseCase/interface";
import { ISendTokensUseCase } from "@useCases/SendTokensUseCase/interface";

interface MessageBody {
  action: Action;
  body: any;
}

type Action = "SEND_NFT" | "SEND_TOKENS";

export class PaymentSQSController {
  constructor(
    private SendNFTUseCase: ISendNFTUseCase,
    private SendTokensUseCase: ISendTokensUseCase,
    private Logger: ILogger
  ) {}

  async dispatch(event: MessageBody): Promise<{ statusCode: number; body: string }> {
    try {
      switch (event.action) {
        case "SEND_NFT":
          await this.SendNFTUseCase.execute(event.body);
          return { statusCode: 200, body: "Ok" };

        case "SEND_TOKENS":
          await this.SendTokensUseCase.execute(event.body);
          return { statusCode: 200, body: "Ok" };

        default:
          return { statusCode: 200, body: "Ok" };
      }
    } catch (error) {
      const err = error as Error;
      this.Logger.error("[PaymentSQSController] Error al enviar el mensaje a SQS:", err.message);
      throw error;
    }
  }
}
