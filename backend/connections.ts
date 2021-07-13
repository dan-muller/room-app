import { Handler } from "aws-lambda";
import { ApiGatewayManagementApi, DynamoDB } from "aws-sdk";

namespace Client {
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
    return [
      await new DynamoDB.DocumentClient().put({ TableName, Item }).promise(),
      Item,
    ];
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
    return [
      await new DynamoDB.DocumentClient().put({ TableName, Item }).promise(),
      Item,
    ];
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

export const connectHandler: Handler = async (event) => {
  console.log("Connect Event:", event);
  try {
    const ConnectionId = event.requestContext.connectionId;
    const RoomCode = event.queryStringParameters.RoomCode;
    const Name = event.queryStringParameters.Name;

    const [, Event] = await Client.connect(RoomCode, ConnectionId, Name);

    const Connections = await Client.listConnections(RoomCode);
    const Api = new ApiGatewayManagementApi({
      endpoint: process.env.ENDPOINT,
    });
    const PostCalls = Connections.filter(
      (Connection) => Connection.Connected
    ).map(async (Connection) => {
      await Api.postToConnection({
        ConnectionId: Connection.ConnectionId,
        Data: JSON.stringify(Event),
      }).promise();
    });

    console.log({ Api, Event, PostCalls: await Promise.all(PostCalls) });

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
    const { RoomCode } = await Client.getRoomInfo(ConnectionId);
    if (RoomCode) {
      const [, Event] = await Client.disconnect(RoomCode, ConnectionId);

      const Connections = await Client.listConnections(RoomCode);
      const Api = new ApiGatewayManagementApi({
        endpoint: process.env.ENDPOINT,
      });
      const PostCalls = Connections.filter(
        (Connection) => Connection.Connected
      ).map(async (Connection) => {
        await Api.postToConnection({
          ConnectionId: Connection.ConnectionId,
          Data: JSON.stringify(Event),
        }).promise();
      });

      console.log({ Api, Event, PostCalls: await Promise.all(PostCalls) });

      return { statusCode: 200, body: "Disconnected." };
    }
    return {
      statusCode: 501,
      body: "Failed to disconnect: RoomCode for ConnectionId not found.",
    };
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

    const { RoomCode } = await Client.getRoomInfo(ConnectionId);
    if (RoomCode) {
      const Connections = await Client.listConnections(RoomCode);

      const Api = new ApiGatewayManagementApi({
        endpoint: process.env.ENDPOINT,
      });
      const PostCalls = Connections.filter(
        (Connection) => Connection.Connected
      ).map(async (Connection) => {
        await Api.postToConnection({
          ConnectionId: Connection.ConnectionId,
          Data: JSON.stringify(Connections),
        }).promise();
      });

      console.log({ Api, PostCalls: await Promise.all(PostCalls) });
    }

    return { statusCode: 200, body: `Echo: "${event.body}"` };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify(e) };
  }
};
