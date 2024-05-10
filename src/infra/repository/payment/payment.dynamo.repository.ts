import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

import { PaymentEntity, Status } from '../../../domain/payment/payment.entity';
import { PaymentRepository } from '../../../domain/payment/payment.repository';
import { createUpdateExpressions } from '../../utils/dynamodb';

export class PaymentDynamoRepository implements PaymentRepository {
  constructor(private readonly dynamoClient: DynamoDBClient) {}

  updatePaymentCallbackStatus = async (id: string, status: Status) => {
    const { updateExpression, expressionAttributeValues, expressionAttributeNames } = createUpdateExpressions({
      callbackStatus: status,
    });

    const response = await this.dynamoClient.send(
      new UpdateItemCommand({
        TableName: 'PAYMENTS',
        Key: { id: { S: id } },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW',
      })
    );

    return response.Attributes as unknown as PaymentEntity;
  };

  updatePayment = async (
    payload: Omit<PaymentEntity, 'createdAt' | 'items' | 'phone' | 'provider' | 'user' | 'callbackStatus'>
  ) => {
    const { id, ...rest } = payload;

    const { updateExpression, expressionAttributeValues, expressionAttributeNames } = createUpdateExpressions(rest);

    const response = await this.dynamoClient.send(
      new UpdateItemCommand({
        TableName: 'PAYMENTS',
        Key: { id: { S: id } },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW',
      })
    );

    return response.Attributes as unknown as PaymentEntity;
  };
}
