import * as dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";
import { TokenPaymentEntity } from "@domain/entities/TokenPaymentEntity";

interface TokenPaymentDocument extends TokenPaymentEntity, Item {}

const PaymentDetailsSchema = new dynamoose.Schema({
  amount: { type: Number, required: true },
  code: { type: String, required: true },
  id: { type: String, required: true },
  updatedAt: { type: Number, required: true },
});

const TokenPaymentSchema = new dynamoose.Schema({
  id: { type: String, required: true, index: { name: "idIndex" } },
  createdAt: { type: Number, required: true, rangeKey: true },
  tokensSent: { type: String, required: true },
  paymentDetails: {
    type: Object,
    required: false,
    schema: PaymentDetailsSchema,
  },
  paymentStatus: { type: String, required: true },
  provider: { type: String, required: true },
  updatedAt: { type: Number, required: true },
  userId: { type: String, required: true, hashKey: true },
  walletPublicKey: { type: String, required: true, index: { name: "walletPublicKeyIndex" } },
});

const tableName = `TOKEN_PAYMENTS_${process.env.ENV}`;

export const TokenPaymentModel = dynamoose.model<TokenPaymentDocument>(tableName, TokenPaymentSchema, { throughput: "ON_DEMAND" });
