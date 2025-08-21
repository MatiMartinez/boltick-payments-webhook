export interface ISQSService {
  sendMessage(messageGroupId: string, messageBody: Record<string, any>): Promise<void>;
}
