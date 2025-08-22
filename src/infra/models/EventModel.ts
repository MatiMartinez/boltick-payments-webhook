import * as dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";
import { EventEntity } from "@domain/entities/EventEntity";

interface EventDocument extends EventEntity, Item {}

const ArtistSchema = new dynamoose.Schema({
  description: { type: String, required: true },
  name: { type: String, required: true },
});

const PRSchema = new dynamoose.Schema({
  id: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  photo: { type: String, required: true },
});

const TicketSchema = new dynamoose.Schema({
  id: { type: String, required: true },
  availableTickets: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  priceWithoutTax: { type: Number, required: true },
  tax: { type: Number, required: true },
});

const EventSchema = new dynamoose.Schema({
  id: { type: String, required: true, hashKey: true },
  artists: { type: Array, schema: [{ type: Object, schema: ArtistSchema }] },
  category: { type: String, required: true },
  collectionName: { type: String, required: true },
  collectionSymbol: { type: String, required: true },
  createdAt: { type: Number, required: true, rangeKey: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  edition: { type: Number, required: true },
  endDate: { type: Number, required: true },
  image: { type: String, required: true },
  location: { type: String, required: true },
  locationLink: { type: String, required: true },
  name: { type: String, required: true },
  prs: { type: Array, schema: [{ type: Object, schema: PRSchema }] },
  startDate: { type: Number, required: true },
  tickets: { type: Array, schema: [{ type: Object, schema: TicketSchema }] },
  time: { type: String, required: true },
});

const tableName = `EVENTS_${process.env.ENV}`;

export const EventModel = dynamoose.model<EventDocument>(tableName, EventSchema, { throughput: "ON_DEMAND" });
