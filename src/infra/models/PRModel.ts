import * as dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";
import { PREntity } from "@domain/entities/PREntity";

interface PRDocument extends PREntity, Item {}

const PRSchema = new dynamoose.Schema({
  email: { type: String, required: true },
  id: { type: String, required: true, rangeKey: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  photo: { type: String, required: true },
  producer: { type: String, required: true, hashKey: true },
  slug: { type: String, required: true },
  createdAt: { type: Number, required: true },
  updatedAt: { type: Number, required: true },
});

const tableName = `PRS_${process.env.ENV}`;

export const PRModel = dynamoose.model<PRDocument>(tableName, PRSchema, { throughput: "ON_DEMAND" });
