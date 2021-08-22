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
  Connected: boolean
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
      if (Items) {
        const RoomInfo = Items.reduce((acc, item) => ({
          Connected: item.EventType === 'Connect',
          RoomCode: acc.RoomCode ?? item.PK,
          UserId: acc.UserId ?? item.UserId,
          UserName: acc.UserName ?? item.UserName,
        } as RoomInfo), {}) as RoomInfo
        console.log({
          ExpressionAttributeValues,
          IndexName,
          Items,
          KeyConditionExpression,
          RoomInfo,
          TableName,
        })
        return RoomInfo as RoomInfo
      }
      console.log({
        ExpressionAttributeValues,
        IndexName,
        Items,
        KeyConditionExpression,
        TableName,
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
