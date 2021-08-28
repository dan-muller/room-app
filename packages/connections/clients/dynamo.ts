import dynamo from 'lib/dynamoDB'
import env from 'lib/env'
import logger from 'lib/logger'
import timestamp from 'lib/timestamp'
import { deleteFrom } from 'lib/objects'

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
  export type AnyEvent = ConnectEvent | DisconnectEvent | Event | MessageEvent

  export type Event = {
    ConnectionId: string
    EventType: typeof TypeEvent
    RoomCode: string
    Timestamp: timestamp.Timestamp
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
      Timestamp: timestamp.now(),
      UserName,
    }
    logger.trace('dynamo.createConnectEvent', {
      ConnectionId,
      EventType,
      Item,
      RoomCode,
      UserName,
    })

    const Result = await dynamo.put({ TableName, Item })
    logger.trace('dynamo.createConnectEvent', {
      ConnectionId,
      Item,
      Result,
      RoomCode,
      TableName,
      UserName,
    })

    logger.info('dynamo.createConnectEvent', { Item })
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
      Timestamp: timestamp.now(),
    }
    logger.trace('dynamo.createDisconnectEvent', {
      ConnectionId,
      EventType,
      Item,
      RoomCode,
    })

    const Result = await dynamo.put({ TableName, Item })
    logger.trace('dynamo.createDisconnectEvent', {
      ConnectionId,
      Item,
      Result,
      RoomCode,
      TableName,
    })

    logger.info('dynamo.createDisconnectEvent', { Item })
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
      Timestamp: timestamp.now(),
    }
    logger.trace('dynamo.createMessageEvent', {
      ConnectionId,
      EventType,
      Item,
      Message,
      RoomCode,
    })

    const Result = await dynamo.put({ TableName, Item })
    logger.trace('dynamo.createMessageEvent', {
      ConnectionId,
      Item,
      Message,
      Result,
      RoomCode,
      TableName,
    })

    logger.info('dynamo.createMessageEvent', { Item })
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
    logger.trace('dynamo.listEventsForRoomCode', {
      ExpressionAttributeValues,
      KeyConditionExpression,
      TableName,
    })

    const Result = await dynamo.query({
      ExpressionAttributeValues,
      KeyConditionExpression,
      TableName,
    })
    logger.trace('dynamo.listEventsForRoomCode', {
      ExpressionAttributeValues,
      KeyConditionExpression,
      Result,
      TableName,
    })

    const { Items } = Result
    const Events = Items?.map((i) => mapEventItem(i))
    logger.trace('dynamo.listEventsForRoomCode', {
      Events,
      ExpressionAttributeValues,
      Items,
      KeyConditionExpression,
      Result,
      TableName,
    })
    logger.info('dynamo.listEventsForRoomCode', { Items, Events })
    return Events ?? []
  }

  export const findConnectEvent = async (
    ConnectionId: string
  ): Promise<ConnectEvent | undefined> => {
    const IndexName = 'ConnectionIdIndex'
    const KeyConditionExpression = 'ConnectionId = :ConnectionId'
    const ExpressionAttributeValues = { ':ConnectionId': ConnectionId }
    logger.trace('dynamo.findConnectEvent', {
      ConnectionId,
      ExpressionAttributeValues,
      IndexName,
      KeyConditionExpression,
      TableName,
    })

    const Result = await dynamo.query({
      ExpressionAttributeValues,
      IndexName,
      KeyConditionExpression,
      TableName,
    })
    logger.trace('dynamo.findConnectEvent', {
      ExpressionAttributeValues,
      IndexName,
      KeyConditionExpression,
      Result,
      TableName,
    })

    const { Items } = Result
    const Event = Items?.[0] as ConnectEvent | undefined
    logger.trace('dynamo.findConnectEvent', {
      Event,
      ExpressionAttributeValues,
      IndexName,
      Items,
      KeyConditionExpression,
      Result,
      TableName,
    })
    logger.info('dynamo.findConnectEvent', { Items, Event })
    return Event
  }

  const listConnected_getFilteredEvents = (Events: AnyEvent[]) => {
    logger.trace('dynamo.listConnected.getFilteredEvents', {
      Events,
    })
    const FilteredEvents: (ConnectEvent | DisconnectEvent)[] = Events.sort(
      (a, b) => timestamp.compare(a.Timestamp, b.Timestamp)
    )
      .filter(
        (event) =>
          'EventType' in event &&
          [TypeConnect, TypeDisconnect].includes(event.EventType)
      )
      .map((event) =>
        event.EventType === TypeConnect
          ? (event as ConnectEvent)
          : (event as DisconnectEvent)
      )
    logger.trace('dynamo.listConnected.getFilteredEvents', {
      Events,
      FilteredEvents,
    })
    return FilteredEvents
  }

  const listConnected_getConnectionIds = (
    FilteredEvents: (ConnectEvent | DisconnectEvent)[]
  ) => {
    logger.trace('dynamo.listConnected.getConnectionIds', {
      FilteredEvents,
    })
    const ConnectionIds = Object.values(
      FilteredEvents.reduce((events, currentEvent) => {
        if (
          'EventType' in currentEvent &&
          currentEvent.EventType === TypeDisconnect
        ) {
          logger.trace(
            'dynamo.listConnected',
            `${currentEvent.ConnectionId} has disconnected.`
          )
          return deleteFrom(
            events,
            (event) => event.ConnectionId === currentEvent.ConnectionId
          )
        }
        logger.trace(
          'dynamo.listConnected',
          `${currentEvent.ConnectionId} has connected.`
        )
        return { ...events, [currentEvent.UserName]: currentEvent }
      }, {} as { [userName: string]: ConnectEvent })
    )
    logger.trace('dynamo.listConnected.getConnectionIds', {
      ConnectionIds,
      FilteredEvents,
    })
    return ConnectionIds
  }

  export const listConnected = async (
    RoomCode: string
  ): Promise<ConnectEvent[]> => {
    logger.trace('dynamo.listConnected', {
      RoomCode,
    })

    const Events = await dynamoClient.listEventsForRoomCode(RoomCode)
    const FilteredEvents = listConnected_getFilteredEvents(Events)
    const ConnectionIds = listConnected_getConnectionIds(FilteredEvents)

    logger.trace('dynamo.listConnected', {
      Events,
      RoomCode,
      FilteredEvents,
      ConnectionIds,
    })
    logger.info('dynamo.listConnected', { ConnectionIds })
    return ConnectionIds
  }
}

export default dynamoClient
