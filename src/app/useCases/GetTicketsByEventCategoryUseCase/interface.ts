import { TicketEntity } from "@domain/entities/TicketEntity";

export interface IGetTicketsByEventCategoryUseCase {
  execute(input: GetTicketsByEventCategoryInput): Promise<GetTicketsByEventCategoryOutput>;
}

export interface GetTicketsByEventCategoryInput {
  eventId: string;
  category: "FREE" | "PAID";
  limit: number;
  lastKey?: any;
}

export interface GetTicketsByEventCategoryOutput {
  success: number;
  message: string;
  data?: {
    tickets: TicketEntity[];
    lastKey?: any;
    hasMore: boolean;
    total: number;
  };
}
