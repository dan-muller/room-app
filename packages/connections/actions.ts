import { OKResponse, Response } from 'lib/response'
import logger from 'lib/logger'
import { DynamoDB } from 'aws-sdk'

export namespace dynamo {
  export const getClient = () => new DynamoDB.DocumentClient()
  const Client = getClient()

  export const getTableName = () => {
    const TableName = process.env.CONNECTIONS_TABLE_NAME
    if (!TableName) {
      throw new Error(
        'The environment variable CONNECTIONS_TABLE_NAME must be set.'
      )
    }
    return TableName
  }
  const TableName = getTableName()

  export const createConnectEvent = async (
    ConnectionId: string,
    RoomCode: string,
    UserId: string,
    UserName: string
  ) => {
    const Item = {
      ConnectionId,
      EventType: 'Connect',
      PK: RoomCode,
      SK: `UserId:${UserId}|EventType:Connect`,
      Timestamp: Date.now(),
      UserId,
      UserName,
    }
    logger.log({ TableName, Item })
    await Client.put({ TableName, Item }).promise()
    return Item
  }
}

namespace events {
  type PublishParams = { exclude: { connectionId: string } }
  export const publish = async (event: any, params: PublishParams) => {
    logger.log({ event, params })
  }
}

export const connect = async (
  connectionId: string,
  roomCode: string,
  userId: string,
  userName: string
): Promise<Response> => {
  const connectEvent = await dynamo.createConnectEvent(
    connectionId,
    roomCode,
    userId,
    userName
  )
  const publishEvent = await events.publish(connectEvent, {
    exclude: { connectionId },
  })
  return new OKResponse(JSON.stringify({ connectEvent, publishEvent }))
}

export const disconnect = async (connectionId: string): Promise<Response> => {
  return new OKResponse(JSON.stringify({ connectionId }))
}

export const sendMessage = async (
  connectionId: string,
  message: string
): Promise<Response> => {
  return new OKResponse(JSON.stringify({ connectionId, message }))
}
