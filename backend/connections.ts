import { Handler } from "aws-lambda";
import { ApiGatewayManagementApi, DynamoDB } from "aws-sdk";

const TableName = process.env.CONNECTIONS_TABLE_NAME;
if (!TableName) {
  throw new Error(
    "The environment variable CONNECTIONS_TABLE_NAME must be set."
  );
}

const Client = {
  connect: async (RoomCode: string, ConnectionId: string, Name: string) => {
    const Item = {
      PK: RoomCode,
      SK: `ConnectionId:${ConnectionId}|EventType:Connect`,
      ConnectionId,
      Name,
      EventType: "Connect",
    };
    console.log({ TableName, Item });
    return new DynamoDB.DocumentClient().put({ TableName, Item }).promise();
  },

  disconnect: async (RoomCode: string, ConnectionId: string) => {
    const Item = {
      PK: RoomCode,
      SK: `ConnectionId:${ConnectionId}|EventType:Disconnect`,
      ConnectionId,
      EventType: "Disconnect",
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

  listRooms: async (ConnectionId: string) => {
    const IndexName = "ConnectionIdIndex";
    const KeyConditionExpression = "ConnectionId = :ConnectionId";
    const ExpressionAttributeValues = { ":ConnectionId": ConnectionId };
    return new DynamoDB.DocumentClient()
      .query({
        TableName,
        IndexName,
        KeyConditionExpression,
        ExpressionAttributeValues,
      })
      .promise()
      .then((value) => {
        const { Items } = value;
        console.log({
          TableName,
          IndexName,
          KeyConditionExpression,
          ExpressionAttributeValues,
          Items,
        });
        return value;
      });
  },
};

export const connectHandler: Handler = async (event) => {
  console.log("Connect Event:", event);
  try {
    const ConnectionId = event.requestContext.connectionId;
    const RoomCode = event.queryStringParameters.RoomCode;
    const Name = event.queryStringParameters.Name;
    console.log("connections Table Name", TableName);
    await Client.connect(RoomCode, ConnectionId, Name);
    return { statusCode: 200, body: "Connected." };
  } catch (e) {
    console.error("error!", e);
    return {
      statusCode: 501,
      body: "Failed to connect:" + JSON.stringify(e),
    };
  }
};

export const disconnectHandler: Handler = async (event) => {
  console.log("Disconnect Event:", event);
  try {
    const ConnectionId = event.requestContext.connectionId;
    const RoomCode = event.queryStringParameters.RoomCode;
    await Client.disconnect(RoomCode, ConnectionId);
    return { statusCode: 200, body: "Disconnected." };
  } catch (e) {
    console.error("error!", e);
    return {
      statusCode: 501,
      body: "Failed to disconnect:" + JSON.stringify(e),
    };
  }
};

export const defaultHandler: Handler = async (event) => {
  console.log("Default Event:", event);
  try {
    const ConnectionId = event.requestContext.connectionId;
    await Client.listRooms(ConnectionId);

    // const api = new ApiGatewayManagementApi({ endpoint: process.env.ENDPOINT });
    // const postCalls = connections?.Items?.map(async ({ Id }: any) => {
    //   await api
    //     .postToConnection({ ConnectionId: Id, Data: JSON.stringify(event) })
    //     .promise();
    // });
    //
    // console.log("Posting events to connections:", postCalls);
    //
    // if (postCalls) {
    //   await Promise.all(postCalls);
    // }

    return { statusCode: 200, body: "Event sent." };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify(e) };
  }
};
