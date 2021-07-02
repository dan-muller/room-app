import { Handler } from "aws-lambda";
import { ApiGatewayManagementApi, DynamoDB } from "aws-sdk";

const TableName = process.env.CONNECTIONS_TABLE_NAME;
if (!TableName) {
  throw new Error(
    "The environment variable CONNECTIONS_TABLE_NAME must be set."
  );
}

const Client = {
  connect: async (RoomCode: string, ConnectionId: string) => {
    const Item = {
      PK: RoomCode,
      SK: `ConnectionId:${ConnectionId}|EventType:Connect`,
    };
    console.log({ TableName, Item });
    return new DynamoDB.DocumentClient().put({ TableName, Item }).promise();
  },

  disconnect: async (RoomCode: string, ConnectionId: string) => {
    const Item = {
      PK: RoomCode,
      SK: `ConnectionId:${ConnectionId}|EventType:Disconnect`,
    };
    console.log({ TableName, Item });
    return new DynamoDB.DocumentClient().put({ TableName, Item }).promise();
  },

  listConnected: async (RoomCode: string) => {
    const KeyConditionExpression = "PK = :RoomCode";
    const ExpressionAttributeValues = { ":RoomCode": RoomCode };
    return new DynamoDB.DocumentClient()
      .query({ TableName, KeyConditionExpression, ExpressionAttributeValues })
      .promise()
      .then((value) => {
        const { Items } = value;
        console.log({
          TableName,
          KeyConditionExpression,
          ExpressionAttributeValues,
          Items,
        });
        return value;
      });
  },
};

export const connectHandler: Handler = async (event) => {
  console.log("Event: ", event);
  try {
    const RoomCode = event.queryStringParameters.RoomCode;
    console.log("connections Table Name", TableName);
    await Client.connect(RoomCode, event.requestContext.connectionId);
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
  console.log("Event: ", event);
  try {
    const RoomCode = event.queryStringParameters.RoomCode;
    await Client.disconnect(RoomCode, event.requestContext.connectionId);
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
    // const api = new ApiGatewayManagementApi({ endpoint: process.env.ENDPOINT });
    const RoomCode = event.queryStringParameters.RoomCode;

    console.log("Event: ", event);

    console.log("Api endpoint: ", process.env.ENDPOINT);

    const connections = await Client.listConnected(RoomCode);

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

    return { statusCode: 200, body: "Event sent." };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify(e) };
  }
};
