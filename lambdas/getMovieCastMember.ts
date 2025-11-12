import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.REGION })
);

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const movieId = event.pathParameters?.movieId
    ? parseInt(event.pathParameters.movieId, 10)
    : undefined;
  const actorId = event.pathParameters?.actorId
    ? parseInt(event.pathParameters.actorId, 10)
    : undefined;

  if (!movieId || !actorId) {
    return {
      statusCode: 404,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ Message: "Missing movieId or actorId" }),
    };
  }

  const out = await ddb.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND sk = :sk",
      ExpressionAttributeValues: {
        ":pk": `c${movieId}`,
        ":sk": `${actorId}`,
      },
      Limit: 1,
    })
  );

  if (!out.Items || out.Items.length === 0) {
    return {
      statusCode: 404,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ Message: "Not found" }),
    };
  }

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ data: out.Items[0] }),
  };
};
