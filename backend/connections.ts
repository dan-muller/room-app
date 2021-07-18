import { Handler } from "aws-lambda";
import { ApiGatewayManagementApi, DynamoDB } from "aws-sdk";

namespace DynamoClient {
  const TableName = process.env.CONNECTIONS_TABLE_NAME;
  if (!TableName) {
    throw new Error(
      "The environment variable CONNECTIONS_TABLE_NAME must be set."
    );
  }

  export const connect = async (
    RoomCode: string,
    ConnectionId: string,
    Name: string
  ) => {
    const Item = {
      ConnectionId,
      EventType: "Connect",
      Name,
      PK: RoomCode,
      SK: `ConnectionId:${ConnectionId}|EventType:Connect`,
      Timestamp: Date.now(),
    };
    console.log({ TableName, Item });
    await new DynamoDB.DocumentClient().put({ TableName, Item }).promise();
    return { ...Item, RoomCode: Item.PK };
  };

  export const disconnect = async (RoomCode: string, ConnectionId: string) => {
    const Item = {
      ConnectionId,
      EventType: "Disconnect",
      PK: RoomCode,
      SK: `ConnectionId:${ConnectionId}|EventType:Disconnect`,
      Timestamp: Date.now(),
    };
    console.log({ TableName, Item });
    await new DynamoDB.DocumentClient().put({ TableName, Item }).promise();
    return { ...Item, RoomCode: Item.PK };
  };

  type RoomInfo = {
    RoomCode: string;
    Name: string;
  };

  export const getRoomInfo = async (
    ConnectionId: string
  ): Promise<RoomInfo> => {
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
        return { RoomCode: Items?.[0]?.PK, Name: Items?.[0]?.Name };
      });
  };

  type Connection = {
    Connected: boolean;
    ConnectionId: string;
    Name: string;
  };

  export const listConnections = async (
    RoomCode: string
  ): Promise<Connection[]> => {
    const KeyConditionExpression = "PK = :RoomCode";
    const ExpressionAttributeValues = { ":RoomCode": RoomCode };
    return new DynamoDB.DocumentClient()
      .query({ TableName, KeyConditionExpression, ExpressionAttributeValues })
      .promise()
      .then((value) => {
        const { Items } = value;
        const Connections = Object.values(
          Items?.reduce(
            (connections, item) => ({
              ...connections,
              [item.ConnectionId]: {
                Connected: item.EventType === "Connect",
                ConnectionId: item.ConnectionId,
                Name: item.Name,
              },
            }),
            {}
          ) as Record<string, Connection>
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
  };
}

namespace ApiClient {
  const Endpoint = process.env.ENDPOINT;
  if (!Endpoint) {
    throw new Error("The environment variable ENDPOINT must be set.");
  }

  export const publishEvent = async (
    ConnectionId: string,
    RoomCode: string,
    Event: any
  ) => {
    const Connections = await DynamoClient.listConnections(RoomCode);
    const Api = new ApiGatewayManagementApi({
      endpoint: process.env.ENDPOINT,
    });

    console.log("ApiClient publishEvent PostToUser");
    const PostToUser = Api.postToConnection({
      ConnectionId: ConnectionId,
      Data: JSON.stringify({ Connections }),
    }).promise();

    console.log("ApiClient publishEvent PostToConnections");

    const PostToConnections = Connections.filter(
      (Connection) => Connection.Connected
    ).map(async (Connection) =>
      Api.postToConnection({
        ConnectionId: Connection.ConnectionId,
        Data: JSON.stringify({ Event }),
      }).promise()
    );

    console.log({
      Api,
      PostToUser: await PostToUser,
      PostToConnections: await Promise.all(PostToConnections),
    });

    return [PostToUser, ...PostToConnections];
  };
}

export const connectHandler: Handler = async (event) => {
  console.log("Connect Event:", event);
  try {
    const ConnectionId = event.requestContext.connectionId;
    const RoomCode = event.queryStringParameters.RoomCode;
    const Name = event.queryStringParameters.Name;
    console.log("Connect Event: write connect event to dynamo");
    const Event = await DynamoClient.connect(RoomCode, ConnectionId, Name);
    console.log("Connect Event: publish event to ws");
    await ApiClient.publishEvent(ConnectionId, RoomCode, Event);
    return { statusCode: 200, body: "Connected." };
  } catch (e) {
    console.error("error!", e);
    return {
      statusCode: 500,
      body: "Failed to connect:" + JSON.stringify(e),
    };
  }
};

export const disconnectHandler: Handler = async (event) => {
  console.log("Disconnect Event:", event);
  try {
    const ConnectionId = event.requestContext.connectionId;
    const { RoomCode } = await DynamoClient.getRoomInfo(ConnectionId);
    if (RoomCode) {
      const Event = await DynamoClient.disconnect(RoomCode, ConnectionId);
      await ApiClient.publishEvent(ConnectionId, RoomCode, Event);
      return { statusCode: 200, body: "Disconnected." };
    }
    return {
      statusCode: 500,
      body: "Failed to disconnect: RoomCode for ConnectionId not found.",
    };
  } catch (e) {
    console.error("error!", e);
    return {
      statusCode: 500,
      body: "Failed to disconnect:" + JSON.stringify(e),
    };
  }
};

export const defaultHandler: Handler = async (event) => {
  console.log("Default Event:", event);
  try {
    const ConnectionId = event.requestContext.connectionId;

    const { RoomCode } = await DynamoClient.getRoomInfo(ConnectionId);
    if (RoomCode) {
      await ApiClient.publishEvent(ConnectionId, RoomCode, event.body);
      return { statusCode: 200, body: `Echo: "${event.body}"` };
    }
    return {
      statusCode: 500,
      body: "RoomCode for ConnectionId not found.",
    };
  } catch (e) {
    console.error("error!", e);
    return { statusCode: 500, body: JSON.stringify(e) };
  }
};
