import { Handler } from "aws-lambda";
import { ApiGatewayManagementApi, DynamoDB } from "aws-sdk";

const TableName = process.env.CONNECTIONS_TABLE_NAME || "Connections";
const Client = {
  connect: async (ConnectionId: string) =>
    new DynamoDB.DocumentClient()
      .put({ TableName, Item: { ConnectionId, Active: "Yes" } })
      .promise(),

  disconnect: async (ConnectionId: string) =>
    new DynamoDB.DocumentClient()
      .put({ TableName, Item: { ConnectionId, Active: "No" } })
      .promise(),

  listConnected: async () =>
    new DynamoDB.DocumentClient()
      .query({
        TableName,
        KeyConditionExpression: "Active = :a",
        ExpressionAttributeValues: {
          ":a": "Yes",
        },
      })
      .promise(),
};

export const connectHandler: Handler = async (event) => {
  try {
    console.log("connections Table Name", TableName);
    await Client.connect(event.requestContext.connectionId);
    return { statusCode: 200, body: "Connected." };
  } catch (e) {
    console.error("error!", e);
    return {
      statusCode: 501,
      body: "Failed to connect: " + JSON.stringify(e),
    };
  }
};

export const disconnectHandler: Handler = async (event) => {
  try {
    await Client.disconnect(event.requestContext.connectionId);
    return { statusCode: 200, body: "Disconnected." };
  } catch (e) {
    console.error("error!", e);
    return {
      statusCode: 501,
      body: "Failed to disconnect: " + JSON.stringify(e),
    };
  }
};

export const defaultHandler: Handler = async (event) => {
  try {
    const api = new ApiGatewayManagementApi({ endpoint: process.env.ENDPOINT });

    const connections = await Client.listConnected();

    console.log("Scanning connections: ", connections);

    // const postCalls = connections?.Items?.map(async ({ Id }: any) => {
    //   await api
    //     .postToConnection({ ConnectionId: Id, Data: JSON.stringify(event) })
    //     .promise();
    // });
    //
    // console.log("Posting events to connections: ", postCalls);
    //
    // if (postCalls) {
    //   await Promise.all(postCalls);
    // }

    console.log("Done");

    return { statusCode: 200, body: "Event sent." };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify(e) };
  }
};
