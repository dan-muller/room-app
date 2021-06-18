import * as aws from "@aws-cdk/core";
import * as cdk from "@aws-cdk/aws-dynamodb";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TableProps } from "@aws-cdk/aws-dynamodb/lib/table";

namespace Connections {
  export const TableName: string = "Connections";
  export const TableProps: TableProps = {
    partitionKey: {
      name: "ConnectionId",
      type: cdk.AttributeType.STRING,
    },
    sortKey: { name: "Active", type: cdk.AttributeType.BINARY },
    billingMode: cdk.BillingMode.PAY_PER_REQUEST,
    removalPolicy: aws.RemovalPolicy.DESTROY,
  };

  export const Client = {
    connect: async (ConnectionId: string) =>
      new DocumentClient()
        .put({ TableName, Item: { ConnectionId, Active: 1 } })
        .promise(),

    disconnect: async (ConnectionId: string) =>
      new DocumentClient()
        .put({ TableName, Item: { ConnectionId, Active: 0 } })
        .promise(),

    listConnected: async () =>
      new DocumentClient()
        .query({
          TableName,
          KeyConditionExpression: "Active = 1",
        })
        .promise(),
  };
}

export default Connections;
