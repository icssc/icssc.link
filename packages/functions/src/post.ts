import { timingSafeEqual } from "node:crypto";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

function compare(a: string, b: string) {
  try {
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

export const main: APIGatewayProxyHandlerV2 = async (event) => {
  const { authorization: a } = event.headers;
  if (!a) return { statusCode: 401 };
  if (!compare(a, `Bearer ${Config.SECRET}`)) return { statusCode: 401 };
  const data = JSON.parse(event.body ?? "{}");
  if (!data.Identifier || !data.Target) return { statusCode: 400 };
  const { Identifier: shortLink, Target: targetLink } = data;
  const command = new PutCommand({
    TableName: Table.Links.tableName,
    Item: { shortLink, targetLink },
  });
  await docClient.send(command);
  return { statusCode: 200 };
};
