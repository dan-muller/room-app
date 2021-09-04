import assert from 'assert'

import dynamoDB from 'lib/dynamoDB'
import timestamp from 'lib/timestamp'

import dynamoClient from '../dynamo'
import * as faker from 'faker'

describe('dynamoClient', () => {
  type MockConnEvt = Omit<
    dynamoClient.ConnectEvent,
    'ConnectionId' | 'EventType' | 'Timestamp' | 'UserId'
  > &
    Partial<Pick<dynamoClient.ConnectEvent, 'ConnectionId' | 'UserId'>>
  const connEvt = ({
    ConnectionId,
    RoomCode,
    UserName,
    UserId,
  }: MockConnEvt): dynamoClient.ConnectEvent => ({
    ConnectionId: ConnectionId ?? connId(UserName),
    EventType: 'Connect',
    RoomCode,
    Timestamp: timestamp.now(),
    UserName,
    UserId: UserId ?? userId(UserName),
  })

  type MockDiscEvt = Omit<
    dynamoClient.DisconnectEvent,
    'EventType' | 'Timestamp'
  >
  const discEvt = ({
    ConnectionId,
    RoomCode,
  }: MockDiscEvt): dynamoClient.DisconnectEvent => ({
    ConnectionId,
    EventType: 'Disconnect',
    RoomCode,
    Timestamp: timestamp.now(),
  })

  const connId = (name: string) =>
    `ConnectionId|${name}|${faker.datatype.number({ min: 1000, max: 9999 })}`
  const userId = (name: string) => `UserId|${name}`

  describe('createConnectEvent', () => {
    it('should return event with the given values', async () => {
      const ConnectionId = 'ConnectionId'
      const RoomCode = 'RoomCode'
      const UserName = 'UserName'
      const UserId = 'UserId'
      jest.spyOn(dynamoDB, 'put').mockResolvedValue(undefined as any)
      const response = await dynamoClient.createConnectEvent(
        ConnectionId,
        RoomCode,
        UserName,
        UserId
      )
      expect(response.ConnectionId).toBe(ConnectionId)
      expect(response.RoomCode).toBe(RoomCode)
      expect(response.UserName).toBe(UserName)
    })
  })

  describe('createDisconnectEvent', () => {
    it('should return event with the given values', async () => {
      const ConnectionId = 'ConnectionId'
      const RoomCode = 'RoomCode'
      jest.spyOn(dynamoDB, 'put').mockResolvedValue(undefined as any)
      const response = await dynamoClient.createDisconnectEvent(
        ConnectionId,
        RoomCode
      )
      expect(response.ConnectionId).toBe(ConnectionId)
      expect(response.RoomCode).toBe(RoomCode)
    })
  })

  describe('createMessageEvent', () => {
    it('should return event with the given values', async () => {
      const ConnectionId = 'ConnectionId'
      const RoomCode = 'RoomCode'
      const Message = 'Message'
      jest.spyOn(dynamoDB, 'put').mockResolvedValue(undefined as any)
      const response = await dynamoClient.createMessageEvent(
        ConnectionId,
        RoomCode,
        Message
      )
      expect(response.ConnectionId).toBe(ConnectionId)
      expect(response.RoomCode).toBe(RoomCode)
      expect(response.Message).toBe(Message)
    })
  })

  describe('listEventsForRoomCode', () => {
    it('maps ConnectEvent results', async () => {
      const RoomCode = 'RoomCode'
      const Items: any[] = [{ EventType: 'Connect' }]
      jest.spyOn(dynamoDB, 'query').mockResolvedValue({ Items } as any)
      const response = await dynamoClient.listEventsForRoomCode(RoomCode)
      expect(response.length).toBe(1)
      assert('EventType' in response[0])
      expect(response[0].EventType).toBe('Connect')
    })
    it('maps DisconnectEvent results', async () => {
      const RoomCode = 'RoomCode'
      const Items: any[] = [{ EventType: 'Disconnect' }]
      jest.spyOn(dynamoDB, 'query').mockResolvedValue({ Items } as any)
      const response = await dynamoClient.listEventsForRoomCode(RoomCode)
      expect(response.length).toBe(1)
      assert('EventType' in response[0])
      expect(response[0].EventType).toBe('Disconnect')
    })
    it('maps MessageEvent results', async () => {
      const RoomCode = 'RoomCode'
      const Items: any[] = [{ EventType: 'Message' }]
      jest.spyOn(dynamoDB, 'query').mockResolvedValue({ Items } as any)
      const response = await dynamoClient.listEventsForRoomCode(RoomCode)
      expect(response.length).toBe(1)
      assert('EventType' in response[0])
      expect(response[0].EventType).toBe('Message')
    })
    it('maps default Event results', async () => {
      const RoomCode = 'RoomCode'
      const Items: any[] = [{}]
      jest.spyOn(dynamoDB, 'query').mockResolvedValue({ Items } as any)
      const response = await dynamoClient.listEventsForRoomCode(RoomCode)
      expect(response.length).toBe(1)
      expect(response[0].EventType).toBe('Event')
    })
  })

  describe('listConnected', () => {
    it('should return one instance of a connection', async () => {
      /**
       * NOTE: This is an impractical test case. ConnectionId is given by AWS
       * so it should be impossible for two connect events to have the same id.
       */
      const RoomCode = 'ROOM1'
      const UserName = 'Amy'
      const evt1 = connEvt({ UserName, RoomCode })
      jest
        .spyOn(dynamoClient, 'listEventsForRoomCode')
        .mockResolvedValue([evt1, evt1])
      const response = await dynamoClient.listConnected(RoomCode)
      expect(response.length).toBe(1)
      expect(response[0]).toBe(evt1)
    })

    it('should return one instance of a user which has connected again with different connection ids', async () => {
      const RoomCode = 'ROOM1'
      const UserName = 'Amy'
      const evt1 = connEvt({ UserName, RoomCode })
      const evt2 = connEvt({ UserName, RoomCode })
      jest
        .spyOn(dynamoClient, 'listEventsForRoomCode')
        .mockResolvedValue([evt1, evt2])
      const response = await dynamoClient.listConnected(RoomCode)
      expect(response.length).toBe(1)
      expect(response[0]).toBe(evt2)
    })

    it('should not return events for disconnected user', async () => {
      const RoomCode = 'ROOM1'
      const UserName = 'Amy'
      const evt1 = connEvt({ UserName, RoomCode })
      const evt2 = discEvt({ ConnectionId: connId(UserName), RoomCode })
      jest
        .spyOn(dynamoClient, 'listEventsForRoomCode')
        .mockResolvedValue([evt1, evt2])
      const response = await dynamoClient.listConnected(RoomCode)
      expect(response.length).toBe(0)
    })
  })
})
