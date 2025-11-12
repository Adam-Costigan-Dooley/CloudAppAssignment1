import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.REGION })
);

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const body = event.body ? JSON.parse(event.body) : undefined;
  if (!body || typeof body.id !== "number") {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ Message: "Invalid body: require numeric id" }),
    };
  }

  const item = {
    pk: `m${body.id}`,
    sk: "xxxx",
    type: "Movie",
    id: body.id,
    title: body.title || "",
    releaseDate: body.releaseDate || "",
    overview: body.overview || "",
  };

  await ddb.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: item,
      ConditionExpression: "attribute_not_exists(pk)",
    })
  );

  return {
    statusCode: 201,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "Movie added" }),
  };
};
