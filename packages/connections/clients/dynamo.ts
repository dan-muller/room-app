import { DynamoDB } from 'aws-sdk'

const TableName = process.env.CONNECTIONS_TABLE_NAME
if (!TableName) {
  throw new Error(
    'The environment variable CONNECTIONS_TABLE_NAME must be set.'
  )
}

export const connect = async (
  ConnectionId: string,
  RoomCode: string,
  UserId: string,
  UserName: string
) => {
  const Item = {
    ConnectionId,
    EventType: 'Connect',
    PK: RoomCode,
    SK: `ConnectionId:${ConnectionId}|EventType:Connect`,
    Timestamp: Date.now(),
    UserId,
    UserName,
  }
  console.log({ TableName, Item })
  await new DynamoDB.DocumentClient().put({ TableName, Item }).promise()
  return { ...Item, RoomCode: Item.PK }
}

export const disconnect = async (ConnectionId: string, RoomCode: string) => {
  const Item = {
    ConnectionId,
    EventType: 'Disconnect',
    PK: RoomCode,
    SK: `ConnectionId:${ConnectionId}|EventType:Disconnect`,
    Timestamp: Date.now(),
  }
  console.log({ TableName, Item })
  await new DynamoDB.DocumentClient().put({ TableName, Item }).promise()
  return { ...Item, RoomCode: Item.PK }
}

type RoomInfo = {
  RoomCode: string
  UserId: string
  UserName: string
}

export const getRoomInfo = async (
  ConnectionId: string
): Promise<RoomInfo | undefined> => {
  const IndexName = 'ConnectionIdIndex2'
  const KeyConditionExpression = 'ConnectionId = :ConnectionId'
  const ExpressionAttributeValues = { ':ConnectionId': ConnectionId }
  return new DynamoDB.DocumentClient()
    .query({
      TableName,
      IndexName,
      KeyConditionExpression,
      ExpressionAttributeValues,
    })
    .promise()
    .then((value) => {
      const { Items } = value
      if (Items && Items[0]) {
        const { PK: RoomCode, UserId, UserName } = Items[0]
        if (RoomCode && UserId && UserName) {
          const RoomInfo: RoomInfo = { RoomCode, UserId, UserName }
          console.log({
            TableName,
            IndexName,
            KeyConditionExpression,
            ExpressionAttributeValues,
            Items,
            RoomInfo,
          })
          return { RoomCode, UserId, UserName }
        }
      }
      console.log({
        TableName,
        IndexName,
        KeyConditionExpression,
        ExpressionAttributeValues,
        Items,
      })
      return undefined
    })
}

export type Connection = {
  Connected: boolean
  ConnectionId: string
  Name: string
}

type ListConnectionsOptions = {
  filter?: (connection: Connection) => boolean
}

export const listConnections = async (
  RoomCode: string,
  options?: ListConnectionsOptions
): Promise<Connection[]> => {
  const KeyConditionExpression = 'PK = :RoomCode'
  const ExpressionAttributeValues = { ':RoomCode': RoomCode }
  return new DynamoDB.DocumentClient()
    .query({ TableName, KeyConditionExpression, ExpressionAttributeValues })
    .promise()
    .then((value) => {
      const { Items } = value
      const Connections = Object.values(
        Items?.reduce(
          (connections, item) => ({
            ...connections,
            [item.ConnectionId]: {
              Connected: item.EventType === 'Connect',
              ConnectionId: item.ConnectionId,
              Name: item.Name,
            },
          }),
          {}
        ) as Record<string, Connection>
      )
      if (options?.filter) {
        const FilteredConnections = Connections.filter(options.filter)
        console.log({
          TableName,
          KeyConditionExpression,
          ExpressionAttributeValues,
          Items,
          Connections,
          FilteredConnections,
        })
        return FilteredConnections
      }
      console.log({
        TableName,
        KeyConditionExpression,
        ExpressionAttributeValues,
        Items,
        Connections,
      })
      return Connections
    })
}
