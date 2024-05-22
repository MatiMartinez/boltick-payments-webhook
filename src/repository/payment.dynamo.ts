import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

import { createUpdateExpressions } from './utils/dynamodb';
import { PaymentEntity } from '../entities/payment.entity';

export const getPaymentDB = async (id: string): Promise<PaymentEntity> => {
  const dynamoClient = getDynamoInstance();

  const response = await dynamoClient.send(
    new GetItemCommand({ TableName: 'PAYMENTS', Key: { id: { S: id } }, ProjectionExpression: 'id, callbackStatus' })
  );

  if (!response.Item) {
    console.log('Error obtaining payment in database.', JSON.stringify(response, null, 2));
    throw new Error('Error obtaining payment in database.');
  }

  return response.Item as unknown as PaymentEntity;
};

export const updatePaymentDB = async (payload: Pick<PaymentEntity, 'id' | 'payment' | 'status'>) => {
  const { id, ...rest } = payload;

  const dynamoClient = getDynamoInstance();

  const { updateExpression, expressionAttributeValues, expressionAttributeNames } = createUpdateExpressions(rest);

  const response = await dynamoClient.send(
    new UpdateItemCommand({
      TableName: 'PAYMENTS',
      Key: { id: { S: id } },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
    })
  );

  if (!response.Attributes) {
    console.log('Error updating payment in database.', JSON.stringify(response, null, 2));
    throw new Error('Error updating payment in database.');
  }

  return response.Attributes as unknown as PaymentEntity;
};

const getDynamoInstance = () => {
  return new DynamoDBClient({ region: 'us-east-1' });
};
