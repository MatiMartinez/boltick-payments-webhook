import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { ISQSService } from "./interface";
import { ILogger } from "@commons/Logger/interface";

export class SQSService implements ISQSService {
  private sqsClient: SQSClient;
  private queueUrl: string;
  private logger: ILogger;

  constructor(SQS_QUEUE_URL: string, logger: ILogger) {
    this.sqsClient = new SQSClient({ region: "us-east-1" });
    this.queueUrl = SQS_QUEUE_URL;
    this.logger = logger;
  }

  async sendMessage(messageGroupId: string, messageBody: Record<string, any>) {
    try {
      const params = {
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(messageBody),
        MessageGroupId: messageGroupId,
      };

      const response = await this.sqsClient.send(new SendMessageCommand(params));

      if (!response.MessageId) {
        this.logger.error("[SQSService] Error al enviar el mensaje a SQS:", response);
        throw new Error("Error al enviar el mensaje a SQS.");
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error("[SQSService] Error al enviar el mensaje a SQS:", err.message);
      throw error;
    }
  }
}
