import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddbDoc = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.REGION })
);

export const handler: APIGatewayProxyHandlerV2 = async () => {
    const out = await ddbDoc.send(
      new ScanCommand({ TableName: process.env.TABLE_NAME })
    );

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: out.Items ?? [] }),
    };
};
