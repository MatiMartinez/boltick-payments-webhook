import { TicketCountModel } from "@models/TicketCount";
import { ITicketCountRepository } from "@domain/repositories/TicketCountRepository";

export class TicketCountDynamoRepository implements ITicketCountRepository {
  async incrementCountByEventId(
    eventId: string,
    increment: number = 1
  ): Promise<void> {
    await TicketCountModel.update({ eventId }, { $ADD: { count: increment } });
  }
}
