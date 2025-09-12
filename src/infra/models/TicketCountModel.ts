import * as dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";
import { TicketCountEntity } from "@domain/entities/TicketCountEntity";

interface TicketCountDocument extends TicketCountEntity, Item {}

const CountSchema = new dynamoose.Schema({
  type: { type: String, required: true },
  count: { type: Number, required: true },
  used: { type: Number, required: true },
});

const TicketCountSchema = new dynamoose.Schema({
  eventId: { type: String, required: true, hashKey: true },
  count: { type: Array, schema: [{ type: Object, schema: CountSchema }] },
});

const tableName = `TICKETS_COUNT_${process.env.ENV}`;

export const TicketCountModel = dynamoose.model<TicketCountDocument>(tableName, TicketCountSchema, { throughput: "ON_DEMAND" });
