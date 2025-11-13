import * as dynamoose from "dynamoose";

import { Item } from "dynamoose/dist/Item";
import { TicketEntity } from "@domain/entities/TicketEntity";

interface TicketDocument extends TicketEntity, Item {}

const TicketSchema = new dynamoose.Schema({
  ticketNumber: { type: String, required: true, index: { name: "ticketNumberIndex" } },
  type: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  metadataUrl: { type: String, required: true },

  eventId: { type: String, required: true, index: { name: "eventIdIndex", type: "global" } },
  eventName: { type: String, required: true },
  prName: { type: String, required: true },

  walletAddress: { type: String, required: true, hashKey: true },
  assetId: { type: String, required: true },
  collectionName: { type: String, required: true },
  collectionSymbol: { type: String, required: true },

  createdAt: { type: Number, required: true, rangeKey: true },
  used: { type: Number, required: true },
  useDate: { type: Number, required: true },

  entryCode: { type: String, required: true },
  entryCodeExpiresAt: { type: Number, required: true },
});

const tableName = `TICKETS_${process.env.ENV}`;

export const TicketModel = dynamoose.model<TicketDocument>(tableName, TicketSchema, {
  throughput: "ON_DEMAND",
});
