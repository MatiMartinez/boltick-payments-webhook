import * as dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";
import { TicketCountEntity } from "@domain/entities/TicketCountEntity";

interface TicketCountDocument extends TicketCountEntity, Item {}

const TicketCountSchema = new dynamoose.Schema({
  eventId: { type: String, required: true, hashKey: true },
  count: { type: Number, required: true },
});

const tableName = `TICKETS_COUNT_${process.env.ENV}`;

export const TicketCountModel = dynamoose.model<TicketCountDocument>(tableName, TicketCountSchema, { throughput: "ON_DEMAND" });
