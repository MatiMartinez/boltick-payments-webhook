export interface IEventBridgeService {
  sendEvent(source: string, detailType: string, detail: Record<string, any>): Promise<void>;
}
