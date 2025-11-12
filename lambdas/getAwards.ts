import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.REGION })
);

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const qs = event.queryStringParameters || {};
  const movieId = qs.movie ? parseInt(qs.movie, 10) : undefined;
  const actorId = qs.actor ? parseInt(qs.actor, 10) : undefined;
  const awardBody = qs.awardBody;

  if (!movieId && !actorId) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ Message: "Provide movie and/or actor" }),
    };
  }

  let KeyConditionExpression = "pk = :pk";
  const ExpressionAttributeValues: Record<string, any> = {};
  const ExpressionAttributeNames: Record<string, string> = {};

  if (movieId) {
    ExpressionAttributeValues[":pk"] = `w${movieId}`;
  } else {
    ExpressionAttributeValues[":pk"] = `w${actorId}`;
  }

  if (awardBody) {
    KeyConditionExpression += " AND sk = :sk";
    ExpressionAttributeValues[":sk"] = awardBody;
  }

  let FilterExpression: string | undefined = undefined;
  if (movieId && actorId) {
    FilterExpression = "#aid = :actorId";
    ExpressionAttributeNames["#aid"] = "actorId";
    ExpressionAttributeValues[":actorId"] = actorId;
  }

  const out = await ddb.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression,
      ExpressionAttributeValues,
      ExpressionAttributeNames:
        Object.keys(ExpressionAttributeNames).length > 0
          ? ExpressionAttributeNames
          : undefined,
      FilterExpression,
    })
  );

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ data: out.Items ?? [] }),
  };
};
