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

  findRoomCode: async (ConnectionId: string) => {
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
          RoomCode: Items?.[0]?.PK,
        });
        return Items?.[0]?.PK;
      });
  },

  listConnections: async (RoomCode: string) => {
    const KeyConditionExpression = "PK = :RoomCode";
    const ExpressionAttributeValues = { ":RoomCode": RoomCode };
    return new DynamoDB.DocumentClient()
      .query({ TableName, KeyConditionExpression, ExpressionAttributeValues })
      .promise()
      .then((value) => {
        const { Items } = value;
        const Connections = Items?.reduce(
          (connections, item) => ({
            ...connections,
            [item.ConnectionId]: {
              Name: item.Name,
              Connected: item.EventType === "Connect",
            },
          }),
          {}
        );
        console.log({
          TableName,
          KeyConditionExpression,
          ExpressionAttributeValues,
          Items,
          Connections,
        });
        return Connections;
      });
  },
};

export const connectHandler: Handler = async (event) => {
  console.log("Connect Event:", event);
  try {
    const ConnectionId = event.requestContext.connectionId;
    const RoomCode = event.queryStringParameters.RoomCode;
    const Name = event.queryStringParameters.Name;
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
    const RoomCode = await Client.findRoomCode(ConnectionId);
    const Connections = await Client.listConnections(RoomCode);

    return { statusCode: 200, body: `Echo: "${event.body}"` };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify(e) };
  }
};
