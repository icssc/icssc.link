import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandlerV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { Table } from "sst/node/table";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const notFoundResponse: APIGatewayProxyStructuredResultV2 = {
  statusCode: 302,
  headers: { Location: "https://studentcouncil.ics.uci.edu/404.html" },
};

export const main: APIGatewayProxyHandlerV2 = async (event) => {
  const { proxy: shortLink } = event.pathParameters ?? {};
  if (!shortLink) return notFoundResponse;
  const command = new GetCommand({ TableName: Table.Links.tableName, Key: { shortLink } });
  const response = await docClient.send(command);
  return response.Item
    ? { statusCode: 301, headers: { Location: response.Item.targetLink } }
    : notFoundResponse;
};
