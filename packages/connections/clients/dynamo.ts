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
    UserId: string
  }

  export const createConnectEvent = async (
    ConnectionId: string,
    RoomCode: string,
    UserName: string,
    UserId: string
  ): Promise<ConnectEvent> => {
    const EventType = TypeConnect
    const Item: ConnectEvent & Item = {
      ConnectionId,
      EventType,
      PK: RoomCode,
      RoomCode,
      SK: `ConnectionId:${ConnectionId}|EventType:${EventType}`,
      Timestamp: timestamp.now(),
      UserId,
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
    UserId: string
    UserName: string
  }

  export const createDisconnectEvent = async (
    ConnectionId: string,
    RoomCode: string,
    UserName: string,
    UserId: string
  ): Promise<DisconnectEvent> => {
    const EventType = TypeDisconnect
    const Item: DisconnectEvent & Item = {
      ConnectionId,
      EventType,
      RoomCode,
      PK: RoomCode,
      SK: `ConnectionId:${ConnectionId}|EventType:${EventType}`,
      Timestamp: timestamp.now(),
      UserName,
      UserId,
    }
    logger.trace('dynamo.createDisconnectEvent', Item)

    const Result = await dynamo.put({ TableName, Item })
    logger.trace('dynamo.createDisconnectEvent', { Result })

    logger.info('dynamo.createDisconnectEvent', { Item })
    return Item
  }

  export type MessageEvent = Omit<Event, 'EventType'> & {
    EventType: typeof TypeMessage
    Message: string
    UserId: string
    UserName: string
  }
  export const createMessageEvent = async (
    ConnectionId: string,
    RoomCode: string,
    UserName: string,
    UserId: string,
    Message: string
  ): Promise<MessageEvent> => {
    const log = (...message: any[]) =>
      logger.debug('dynamo.createMessageEvent', ...message)
    const EventType = TypeMessage
    const Item: MessageEvent & Item = {
      ConnectionId,
      EventType,
      Message,
      PK: RoomCode,
      RoomCode,
      SK: `ConnectionId:${ConnectionId}|EventType:${EventType}`,
      Timestamp: timestamp.now(),
      UserName,
      UserId,
    }
    log({ Item })

    const Result = await dynamo.put({ TableName, Item })
    log({ Result })

    return Item
  }

  const mapEventItem = (Item: any): AnyEvent => {
    switch (Item.EventType) {
      case TypeConnect:
        return Item as ConnectEvent
      case TypeDisconnect:
        return Item as DisconnectEvent
      case TypeMessage:
        return Item as MessageEvent
      default:
        return { ...Item, EventType: TypeEvent } as Event
    }
  }

  export const listEventsForRoomCode = async (
    RoomCode: string
  ): Promise<AnyEvent[]> => {
    const KeyConditionExpression = 'PK = :RoomCode'
    const ExpressionAttributeValues = { ':RoomCode': RoomCode }
    logger.debug('dynamo.listEventsForRoomCode', {
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
    const Events = Items?.map(mapEventItem)
    logger.trace('dynamo.listEventsForRoomCode', {
      Events,
      ExpressionAttributeValues,
      Items,
      KeyConditionExpression,
      Result,
      TableName,
    })

    logger.debug('dynamo.listEventsForRoomCode', { Items, Events })
    return Events ?? []
  }

  export const findConnectEvent = async (
    ConnectionId: string
  ): Promise<ConnectEvent | undefined> => {
    const IndexName = 'ConnectionIdIndex'
    const KeyConditionExpression = 'ConnectionId = :ConnectionId'
    const ExpressionAttributeValues = { ':ConnectionId': ConnectionId }
    logger.debug('dynamo.findConnectEvent', {
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
    logger.debug('dynamo.findConnectEvent', { Items, Event })
    return Event
  }

  const listConnected_removeEvent = (
    Events: { [EventId: string]: ConnectEvent },
    ConnectionId: string
  ) => {
    const NewEvents = deleteFrom(
      Events,
      (event) => event.ConnectionId === ConnectionId
    )
    logger.trace(
      'listConnected_removeEvent',
      {
        Events,
        ConnectionId,
        NewEvents,
      },
      `Event Count: ${Object.values(Events).length} -> ${
        Object.values(NewEvents).length
      }`
    )
    return NewEvents
  }

  const listConnected_addEvent = (
    Events: { [EventId: string]: ConnectEvent },
    Event: ConnectEvent
  ) => {
    const NewEvents = { ...Events, [Event.UserId]: Event }
    logger.trace(
      'listConnected_addEvent',
      { Events, Event, NewEvents },
      `Event Count: ${Object.values(Events).length} -> ${
        Object.values(NewEvents).length
      }`
    )
    return NewEvents
  }

  export const listConnected = async (
    RoomCode: string
  ): Promise<ConnectEvent[]> => {
    logger.debug('dynamo.listConnected', { RoomCode })
    const Events = await dynamoClient.listEventsForRoomCode(RoomCode)
    const UniqueConnections: ConnectEvent[] = Object.values(
      Events
        /**
         * 1. Sort the events in the order of their Timestamps
         */
        .sort((a, b) => timestamp.compare(a.Timestamp, b.Timestamp))
        /**
         * 2. Filter out non connect/disconnect events.
         * This step is needed because this logic only cares about events with
         * these event types.
         */
        .filter(
          (Event) =>
            'EventType' in Event &&
            [TypeConnect, TypeDisconnect].includes(Event.EventType)
        )
        /**
         * 3. Map the events to either ConnectEvent or DisconnectEvent.
         * This step is needed because we want the implicit type of the stream
         * to be  `(ConnectEvent | DisconnectEvent)[]`. This logic is safe
         * because of the preceding filter.
         */
        .map((Event) =>
          Event.EventType === TypeConnect
            ? (Event as ConnectEvent)
            : (Event as DisconnectEvent)
        )
        /**
         * 4. Reduce the stream to an object with `UserId` as keys.
         * This step will add connect events to the object and then remove the
         * connect events if a disconnect event with the same connection id comes
         * up.
         */
        .reduce(
          (Events, CurrentEvent) =>
            CurrentEvent.EventType === TypeDisconnect
              ? listConnected_removeEvent(Events, CurrentEvent.ConnectionId)
              : listConnected_addEvent(Events, CurrentEvent),
          {} as { [userId: string]: ConnectEvent }
        )
      /**
       * 5. Use `Object.values` to turn the reduced object into an array.
       * This array will be of type `ConnectEvent[]` with no connections that
       * have disconnected and only the last connection for a `UserId` which
       * has connected multiple times.
       */
    )
    logger.trace('dynamo.listConnected', {
      UniqueConnections,
      Events,
      RoomCode,
    })
    logger.debug('dynamo.listConnected', { UniqueConnections, Events })
    return UniqueConnections
  }
}

export default dynamoClient
