import * as aws from "@aws-cdk/core";
import * as cdk from "@aws-cdk/aws-dynamodb";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

namespace Connections {
  const TableName: string = "Connections";
  const TableProps: cdk.TableProps = {
    partitionKey: {
      name: "PK",
      type: cdk.AttributeType.STRING,
    },
    sortKey: { name: "SK", type: cdk.AttributeType.STRING },
    billingMode: cdk.BillingMode.PAY_PER_REQUEST,
    removalPolicy: aws.RemovalPolicy.DESTROY,
  };

  // SK: Connection:<ConnectionId>|EventType:<Connect | Disconnect>

  export class Table extends dynamodb.Table {
    constructor(parent: aws.Construct) {
      super(parent, TableName, TableProps);
    }
  }
}

export default Connections;
