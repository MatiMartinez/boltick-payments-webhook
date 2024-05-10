import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

import { TicketEntity } from '../../../domain/ticket/ticket.entity';
import { TicketRepository } from '../../../domain/ticket/ticket.repository';
import { createUpdateExpressions } from '../../utils/dynamodb';

export class TicketDynamoRepository implements TicketRepository {
  constructor(private readonly dynamoClient: DynamoDBClient) {}

  createTickets = async (tickets: TicketEntity[]) => {
    const response = await Promise.all(
      tickets.map(async ({ id, ...rest }) => {
        const { updateExpression, expressionAttributeValues, expressionAttributeNames } = createUpdateExpressions(rest);

        return await this.dynamoClient.send(
          new UpdateItemCommand({
            TableName: 'TICKETS',
            Key: { id: { S: id } },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames,
            ReturnValues: 'ALL_NEW',
          })
        );
      })
    );

    return response.map(({ Attributes }) => Attributes as unknown as TicketEntity);
  };
}
