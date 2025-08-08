import * as dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";
import { PaymentEntity } from "@domain/entities/PaymentEntity";

interface PaymentDocument extends PaymentEntity, Item {}

const NFTSchema = new dynamoose.Schema({
  id: { type: String, required: true },
  collectionName: { type: String, required: true },
  collectionSymbol: { type: String, required: true },
  imageUrl: { type: String, required: true },
  metadataUrl: { type: String, required: true },
  mint: { type: String, required: true },
  mintDate: { type: Number, required: true },
  ticketNumber: { type: String, required: true },
  transactionId: { type: String, required: true },
  type: { type: String, required: true },
  unitPrice: { type: Number, required: true },
});

const PaymentDetailsSchema = new dynamoose.Schema({
  amount: { type: Number, required: true },
  code: { type: String, required: true },
  id: { type: String, required: true },
  updatedAt: { type: Number, required: true },
});

const PaymentSchema = new dynamoose.Schema({
  id: { type: String, required: true, index: { name: "idIndex" } },
  callbackStatus: { type: String, required: true },
  createdAt: { type: Number, required: true, rangeKey: true },
  eventId: { type: String, required: true },
  eventName: { type: String, required: true },
  nfts: { type: Array, schema: [{ type: Object, schema: NFTSchema }] },
  paymentDetails: {
    type: Object,
    required: false,
    schema: PaymentDetailsSchema,
  },
  paymentStatus: { type: String, required: true },
  prName: { type: String, required: true },
  provider: { type: String, required: true },
  updatedAt: { type: Number, required: true },
  userId: { type: String, required: true, hashKey: true },
  walletPublicKey: { type: String, required: true },
});

const tableName = `PAYMENTS_${process.env.ENV}`;

export const PaymentModel = dynamoose.model<PaymentDocument>(tableName, PaymentSchema, { throughput: "ON_DEMAND" });
