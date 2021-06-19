import * as aws from "@aws-cdk/core";
import * as cdk from "@aws-cdk/aws-dynamodb";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

namespace Connections {
  const TableName: string = "Connections";
  const TableProps: cdk.TableProps = {
    partitionKey: {
      name: "ConnectionId",
      type: cdk.AttributeType.STRING,
    },
    sortKey: { name: "Active", type: cdk.AttributeType.STRING },
    billingMode: cdk.BillingMode.PAY_PER_REQUEST,
    removalPolicy: aws.RemovalPolicy.DESTROY,
  };

  export class Table extends dynamodb.Table {
    constructor(parent: aws.Construct) {
      super(parent, TableName, TableProps);
    }
  }
}

export default Connections;
