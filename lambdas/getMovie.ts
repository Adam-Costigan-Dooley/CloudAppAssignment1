import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.REGION })
);

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const id = event.pathParameters?.movieId
    ? parseInt(event.pathParameters.movieId, 10)
    : undefined;

  if (!id) {
    return {
      statusCode: 404,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ Message: "Missing movie Id" }),
    };
  }

  const out = await ddb.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { pk: `m${id}`, sk: "xxxx" },
    })
  );

  if (!out.Item) {
    return {
      statusCode: 404,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ Message: "Invalid movie Id" }),
    };
  }

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ data: out.Item }),
  };
};
