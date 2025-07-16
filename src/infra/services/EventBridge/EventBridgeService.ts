import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

import { IEventBridgeService } from "./interface";

export class EventBridgeService implements IEventBridgeService {
  private EventBridgeClient: EventBridgeClient;

  constructor() {
    this.EventBridgeClient = new EventBridgeClient({ region: "us-east-1" });
  }

  async sendEvent(
    source: string,
    detailType: string,
    detail: Record<string, any>
  ) {
    try {
      const params = {
        Entries: [
          {
            Source: source,
            DetailType: detailType,
            Detail: JSON.stringify(detail),
          },
        ],
      };

      const response = await this.EventBridgeClient.send(
        new PutEventsCommand(params)
      );

      if (response.FailedEntryCount && response.FailedEntryCount > 0) {
        console.log(`Event failed to send:`, response.Entries);
        throw new Error("Failed to send event to EventBridge.");
      }

      console.log("Event successfully sent to EventBridge");
    } catch (error) {
      const err = error as Error;
      console.log(err.message);
      throw new Error("Error sending event to EventBridge.");
    }
  }
}
