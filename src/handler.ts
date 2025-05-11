import { APIGatewayProxyEventV2, Context, SQSEvent } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';

import { app } from './server';
import { Container } from '@containers/Container';

let serverlessExpressInstance: any;

const setup = async (event: APIGatewayProxyEventV2, context: Context) => {
  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context);
};

export const handler = async (event: SQSEvent | APIGatewayProxyEventV2, context: Context) => {
  console.log('Event: ', JSON.stringify(event, null, 2));

  if ('Records' in event && event.Records.length > 0) {
    const parsedRecordBody = JSON.parse(event.Records[0].body);
    const PaymentSQSController = Container.getInstance().getPaymentSQSController();
    return await PaymentSQSController.dispatch(parsedRecordBody);
  }

  if ('requestContext' in event) {
    if (serverlessExpressInstance) return serverlessExpressInstance(event, context);
    return await setup(event, context);
  }

  return { statusCode: 200, body: JSON.stringify(event) };
};
