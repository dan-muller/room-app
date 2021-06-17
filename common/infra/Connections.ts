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
    sortKey: { name: "Timestamp", type: cdk.AttributeType.STRING },
    billingMode: cdk.BillingMode.PAY_PER_REQUEST,
    removalPolicy: aws.RemovalPolicy.DESTROY,
  };

  export const Client = {
    put: async (ConnectionId: string) =>
      new DocumentClient().put({ TableName, Item: { ConnectionId } }).promise(),

    delete: async (ConnectionId: string) =>
      new DocumentClient()
        .delete({ TableName, Key: { ConnectionId } })
        .promise(),

    scan: async () =>
      new DocumentClient()
        .scan({ TableName, ProjectionExpression: "Id" })
        .promise(),
  };
}

export default Connections;
