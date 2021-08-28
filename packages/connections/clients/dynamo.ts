import dynamo from 'lib/dynamoDb'
import logger from 'lib/logger'
import env from 'lib/env'
import { deleteFrom } from '../lib/objects'

namespace dynamoClient {
  const TableName = env.get('CONNECTIONS_TABLE_NAME')
  if (env.get('NODE_ENV') === 'production' && !TableName) {
    throw new Error(
      'The environment variable CONNECTIONS_TABLE_NAME must be set.'
    )
  }

  type Item = {
    PK: string
    SK: string
  }

  const TypeConnect = 'Connect'
  const TypeDisconnect = 'Disconnect'
  const TypeMessage = 'Message'
  const TypeEvent = 'Event'
  type AnyEvent = ConnectEvent | DisconnectEvent | Event | MessageEvent

  type Event = {
    ConnectionId: string
    EventType: typeof TypeEvent
    RoomCode: string
    Timestamp: number
  }

  export type ConnectEvent = Omit<Event, 'EventType'> & {
    EventType: typeof TypeConnect
    UserName: string
  }

  export const createConnectEvent = async (
    ConnectionId: string,
    RoomCode: string,
    UserName: string
  ): Promise<ConnectEvent> => {
    const EventType = TypeConnect
    const Item: ConnectEvent & Item = {
      ConnectionId,
      EventType,
      PK: RoomCode,
      RoomCode,
      SK: `ConnectionId:${ConnectionId}|EventType:${EventType}`,
      Timestamp: Date.now(),
      UserName,
    }
    await dynamo.put({ TableName, Item })
    logger.info('dynamo.createConnectEvent', { TableName, Item })
    return Item
  }

  export type DisconnectEvent = Omit<Event, 'EventType'> & {
    EventType: typeof TypeDisconnect
  }

  export const createDisconnectEvent = async (
    ConnectionId: string,
    RoomCode: string
  ): Promise<DisconnectEvent> => {
    const EventType = TypeDisconnect
    const Item: DisconnectEvent & Item = {
      ConnectionId,
      EventType,
      RoomCode,
      PK: RoomCode,
      SK: `ConnectionId:${ConnectionId}|EventType:${EventType}`,
      Timestamp: Date.now(),
    }
    await dynamo.put({ TableName, Item })
    logger.info('dynamo.createDisconnectEvent', { TableName, Item })
    return Item
  }

  export type MessageEvent = Omit<Event, 'EventType'> & {
    EventType: typeof TypeMessage
    Message: string
  }
  export const createMessageEvent = async (
    ConnectionId: string,
    RoomCode: string,
    Message: string
  ): Promise<MessageEvent> => {
    const EventType = TypeMessage
    const Item: MessageEvent & Item = {
      ConnectionId,
      EventType,
      Message,
      PK: RoomCode,
      RoomCode,
      SK: `ConnectionId:${ConnectionId}|EventType:${EventType}`,
      Timestamp: Date.now(),
    }
    await dynamo.put({ TableName, Item })
    logger.info('dynamo.createMessageEvent', { TableName, Item })
    return Item
  }

  const mapEventItem = (Item: any): AnyEvent => {
    switch (Item.EventType) {
      case TypeConnect:
        return <ConnectEvent>Item
      case TypeDisconnect:
        return <DisconnectEvent>Item
      case TypeMessage:
        return <MessageEvent>Item
      default:
        return <Event>{ ...Item, EventType: TypeEvent }
    }
  }

  export const listEventsForRoomCode = async (
    RoomCode: string
  ): Promise<AnyEvent[]> => {
    const KeyConditionExpression = 'PK = :RoomCode'
    const ExpressionAttributeValues = { ':RoomCode': RoomCode }
    const { Items } = await dynamo.query({
      ExpressionAttributeValues,
      KeyConditionExpression,
      TableName,
    })
    const Events = Items?.map((i) => mapEventItem(i))
    logger.info('dynamo.listEventsForRoomCode', { TableName, Items, Events })
    return Events ?? []
  }

  export const findConnectEvent = async (
    ConnectionId: string
  ): Promise<ConnectEvent | undefined> => {
    const IndexName = 'ConnectionIdIndex'
    const KeyConditionExpression = 'ConnectionId = :ConnectionId'
    const ExpressionAttributeValues = { ':ConnectionId': ConnectionId }
    const { Items } = await dynamo.query({
      TableName,
      IndexName,
      KeyConditionExpression,
      ExpressionAttributeValues,
    })
    return Items?.[0] as ConnectEvent | undefined
  }

  export const listConnected = async (
    RoomCode: string
  ): Promise<ConnectEvent[]> => {
    const Events = await dynamoClient.listEventsForRoomCode(RoomCode)
    const ConnectionIds = Object.values(
      Events.sort((a, b) => a.Timestamp - b.Timestamp)
        .filter(
          (event) =>
            'EventType' in event &&
            [TypeConnect, TypeDisconnect].includes(event.EventType)
        )
        .reduce(
          (events, currentEvent) =>
            'EventType' in currentEvent &&
            currentEvent.EventType === TypeConnect
              ? { ...events, [currentEvent.UserName]: currentEvent }
              : deleteFrom(
                  events,
                  (event) => event.ConnectionId === currentEvent.ConnectionId
                ),
          {} as { [userName: string]: ConnectEvent }
        )
    )
    logger.info('listConnected', { ConnectionIds })
    return ConnectionIds
  }
}

export default dynamoClient
