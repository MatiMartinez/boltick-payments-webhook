type DynamoDBValue =
  | { S: string }
  | { N: string }
  | { BOOL: boolean }
  | { L: DynamoDBValue[] }
  | { M: { [key: string]: DynamoDBValue } };

type Item = { [key: string]: any };

export const createUpdateExpressions = (item: Item) => {
  const updateExpression: string[] = [];
  const expressionAttributeValues: { [placeholder: string]: DynamoDBValue } = {};
  const expressionAttributeNames: { [alias: string]: string } = {};

  const formatValue = (value: any): DynamoDBValue => {
    if (typeof value === 'string') {
      return { S: value };
    } else if (typeof value === 'number') {
      return { N: value.toString() };
    } else if (typeof value === 'boolean') {
      return { BOOL: value };
    } else if (Array.isArray(value)) {
      return { L: value.map((v) => formatValue(v)) };
    } else if (typeof value === 'object' && value !== null) {
      const formattedObject: { [key: string]: DynamoDBValue } = {};
      Object.keys(value).forEach((key) => {
        formattedObject[key] = formatValue(value[key]);
      });
      return { M: formattedObject };
    } else {
      throw new Error(`Unsupported type for value: ${value}`);
    }
  };

  Object.keys(item).forEach((key) => {
    const placeholder = `:${key}`;
    const alias = `#${key}`;
    updateExpression.push(`${alias} = ${placeholder}`);
    expressionAttributeValues[placeholder] = formatValue(item[key]);
    expressionAttributeNames[alias] = key;
  });

  return { updateExpression, expressionAttributeValues, expressionAttributeNames };
};
