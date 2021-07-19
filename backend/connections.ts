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

  export type Connection = {
    Connected: boolean;
    ConnectionId: string;
    Name: string;
  };

  type ListConnectionsOptions = {
    filter?: (connection: Connection) => boolean;
  };

  export const listConnections = async (
    RoomCode: string,
    options?: ListConnectionsOptions
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
        if (options?.filter) {
          const FilteredConnections = Connections.filter(options.filter);
          console.log({
            TableName,
            KeyConditionExpression,
            ExpressionAttributeValues,
            Items,
            Connections,
            FilteredConnections,
          });
          return FilteredConnections;
        }
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
  const Api = new ApiGatewayManagementApi({
    endpoint: process.env.ENDPOINT,
  });

  export const postToConnections = async (
    Connections: DynamoClient.Connection[],
    Event: any
  ) => {
    const PostToConnections = Promise.all(
      Connections.map(async ({ ConnectionId }) =>
        Api.postToConnection(
          {
            ConnectionId,
            Data: Buffer.from(JSON.stringify({ Event })),
          },
          (err, data) => {
            console.log("PostToConnections err:", err);
            console.log("ApiClient PostToConnections data:", data);
          }
        )
          .promise()
          .then(
            (data) => {
              console.log("PostToConnections then data:", data);
            },
            (reason) => console.error("Failed to post to connections: ", reason)
          )
      )
    );

    console.log({
      Api,
      PostToConnections: await PostToConnections,
    });

    return await PostToConnections;
  };
}

const publishToConnections = async (
  RoomCode: string,
  ConnectionId: string,
  Event: any
) => {
  const Connections = await DynamoClient.listConnections(RoomCode, {
    filter: (Connection) =>
      Connection.Connected && Connection.ConnectionId !== ConnectionId,
  });
  await ApiClient.postToConnections(Connections, Event);
  return Connections;
};

export const connectHandler: Handler = async (event) => {
  console.log("Connect Event:", event);
  try {
    const ConnectionId = event.requestContext.connectionId;
    const RoomCode = event.queryStringParameters.RoomCode;
    const Name = event.queryStringParameters.Name;

    const Event = await DynamoClient.connect(RoomCode, ConnectionId, Name);
    const Connections = publishToConnections(RoomCode, ConnectionId, Event);

    return { statusCode: 200, body: JSON.stringify({ Connections }) };
  } catch (e) {
    console.error("error!", e);
    return { statusCode: 500, body: "Failed to connect:" + JSON.stringify(e) };
  }
};

export const disconnectHandler: Handler = async (event) => {
  console.log("Disconnect Event:", event);
  try {
    const ConnectionId = event.requestContext.connectionId;
    const { RoomCode } = await DynamoClient.getRoomInfo(ConnectionId);

    if (RoomCode) {
      const Event = await DynamoClient.disconnect(RoomCode, ConnectionId);
      const Connections = publishToConnections(RoomCode, ConnectionId, Event);

      return { statusCode: 200, body: JSON.stringify({ Connections }) };
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
    const Event = event.body;
    const { RoomCode } = await DynamoClient.getRoomInfo(ConnectionId);

    if (RoomCode) {
      const Connections = publishToConnections(RoomCode, ConnectionId, Event);

      return { statusCode: 200, body: JSON.stringify({ Connections }) };
    }
    return { statusCode: 500, body: "RoomCode for ConnectionId not found." };
  } catch (e) {
    console.error("error!", e);
    return { statusCode: 500, body: JSON.stringify(e) };
  }
};
