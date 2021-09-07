import * as faker from 'faker'

import dynamoClient from '../dynamo'
import dynamoDB from '../../lib/dynamoDB'
import timestamp from '../../lib/timestamp'

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
    dynamoClient.ConnectEvent,
    'ConnectionId' | 'EventType' | 'Timestamp' | 'UserId'
  > &
    Partial<Pick<dynamoClient.DisconnectEvent, 'ConnectionId' | 'UserId'>>
  const discEvt = ({
    ConnectionId,
    RoomCode,
    UserName,
    UserId,
  }: MockDiscEvt): dynamoClient.DisconnectEvent => ({
    ConnectionId: ConnectionId ?? connId(UserName),
    EventType: 'Disconnect',
    RoomCode,
    Timestamp: timestamp.now(),
    UserName,
    UserId: UserId ?? userId(UserName),
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
      const UserId = 'UserId'
      const UserName = 'UserName'
      jest.spyOn(dynamoDB, 'put').mockResolvedValue(undefined as any)
      const response = await dynamoClient.createDisconnectEvent(
        ConnectionId,
        RoomCode,
        UserId,
        UserName
      )
      expect(response.ConnectionId).toBe(ConnectionId)
      expect(response.RoomCode).toBe(RoomCode)
    })
  })

  describe('createMessageEvent', () => {
    it('should return event with the given values', async () => {
      const ConnectionId = 'ConnectionId'
      const Message = 'Message'
      const RoomCode = 'RoomCode'
      const UserId = 'UserId'
      const UserName = 'UserName'
      jest.spyOn(dynamoDB, 'put').mockResolvedValue(undefined as any)
      const response = await dynamoClient.createMessageEvent(
        ConnectionId,
        RoomCode,
        UserId,
        UserName,
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
      expect(response[0].EventType).toBe('Connect')
    })
    it('maps DisconnectEvent results', async () => {
      const RoomCode = 'RoomCode'
      const Items: any[] = [{ EventType: 'Disconnect' }]
      jest.spyOn(dynamoDB, 'query').mockResolvedValue({ Items } as any)
      const response = await dynamoClient.listEventsForRoomCode(RoomCode)
      expect(response.length).toBe(1)
      expect(response[0].EventType).toBe('Disconnect')
    })
    it('maps MessageEvent results', async () => {
      const RoomCode = 'RoomCode'
      const Items: any[] = [{ EventType: 'Message' }]
      jest.spyOn(dynamoDB, 'query').mockResolvedValue({ Items } as any)
      const response = await dynamoClient.listEventsForRoomCode(RoomCode)
      expect(response.length).toBe(1)
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
      const evt2 = discEvt({ UserName, RoomCode })
      jest
        .spyOn(dynamoClient, 'listEventsForRoomCode')
        .mockResolvedValue([evt1, evt2])
      const response = await dynamoClient.listConnected(RoomCode)
      expect(response.length).toBe(0)
    })

    describe('static data test', () => {
      it('should return only events for users that have not disconnected', async () => {
        const Events = [
          {
            Timestamp: '2021-09-06T13:27:30.242Z',
            ConnectionId: 'FPiQgfk5oAMCFrg=',
            EventType: 'Disconnect',
            SK: 'ConnectionId:FPiQgfk5oAMCFrg=|EventType:Disconnect',
            RoomCode: 'abc123',
            PK: 'abc123',
          },
          {
            UserId: '75c3fcd0-f541-4215-bb13-c2112d069c19',
            Timestamp: '2021-09-06T13:26:53.330Z',
            ConnectionId: 'FPiMmeN7IAMCJ7A=',
            EventType: 'Connect',
            SK: 'ConnectionId:FPiMmeN7IAMCJ7A=|EventType:Connect',
            RoomCode: 'abc123',
            PK: 'abc123',
            UserName: 'Ben',
          },
          {
            UserId: '75c3fcd0-f541-4215-bb13-c2112d069c19',
            Timestamp: '2021-09-06T13:27:18.344Z',
            ConnectionId: 'FPiQgfk5oAMCFrg=',
            EventType: 'Connect',
            SK: 'ConnectionId:FPiQgfk5oAMCFrg=|EventType:Connect',
            RoomCode: 'abc123',
            PK: 'abc123',
            UserName: 'Ben',
          },
          {
            UserId: '75c3fcd0-f541-4215-bb13-c2112d069c19',
            Timestamp: '2021-09-06T13:27:30.425Z',
            ConnectionId: 'FPiSZff7IAMCJkQ=',
            EventType: 'Connect',
            SK: 'ConnectionId:FPiSZff7IAMCJkQ=|EventType:Connect',
            RoomCode: 'abc123',
            PK: 'abc123',
            UserName: 'Ben',
          },
          {
            Timestamp: '2021-09-06T13:27:00.454Z',
            ConnectionId: 'FPiMmeN7IAMCJ7A=',
            EventType: 'Disconnect',
            SK: 'ConnectionId:FPiMmeN7IAMCJ7A=|EventType:Disconnect',
            RoomCode: 'abc123',
            PK: 'abc123',
          },
          {
            UserId: '513c65ab-bfe5-4350-bb72-9f390be943ea',
            Timestamp: '2021-09-06T13:25:46.521Z',
            ConnectionId: 'FPiCDficIAMCERQ=',
            EventType: 'Connect',
            SK: 'ConnectionId:FPiCDficIAMCERQ=|EventType:Connect',
            RoomCode: 'abc123',
            PK: 'abc123',
            UserName: 'Dan',
          },
          {
            Timestamp: '2021-09-06T13:27:33.551Z',
            Message: 'Hello WS, I have connected.',
            ConnectionId: 'FPiSZff7IAMCJkQ=',
            EventType: 'Message',
            SK: 'ConnectionId:FPiSZff7IAMCJkQ=|EventType:Message',
            RoomCode: 'abc123',
            PK: 'abc123',
          },
          {
            Timestamp: '2021-09-06T13:27:36.653Z',
            Message: 'Hello WS, I have connected.',
            ConnectionId: 'FPiRqcwPoAMCK4w=',
            EventType: 'Message',
            SK: 'ConnectionId:FPiRqcwPoAMCK4w=|EventType:Message',
            RoomCode: 'abc123',
            PK: 'abc123',
          },
          {
            UserId: '513c65ab-bfe5-4350-bb72-9f390be943ea',
            Timestamp: '2021-09-06T13:27:25.684Z',
            ConnectionId: 'FPiRqcwPoAMCK4w=',
            EventType: 'Connect',
            SK: 'ConnectionId:FPiRqcwPoAMCK4w=|EventType:Connect',
            RoomCode: 'abc123',
            PK: 'abc123',
            UserName: 'Dan',
          },
          {
            Timestamp: '2021-09-06T13:27:17.889Z',
            ConnectionId: 'FPiNocMgIAMCFUA=',
            EventType: 'Disconnect',
            SK: 'ConnectionId:FPiNocMgIAMCFUA=|EventType:Disconnect',
            RoomCode: 'abc123',
            PK: 'abc123',
          },
          {
            UserId: '75c3fcd0-f541-4215-bb13-c2112d069c19',
            Timestamp: '2021-09-06T13:26:59.954Z',
            ConnectionId: 'FPiNocMgIAMCFUA=',
            EventType: 'Connect',
            SK: 'ConnectionId:FPiNocMgIAMCFUA=|EventType:Connect',
            RoomCode: 'abc123',
            PK: 'abc123',
            UserName: 'Ben',
          },
          {
            Timestamp: '2021-09-06T13:27:24.957Z',
            ConnectionId: 'FPiCDficIAMCERQ=',
            EventType: 'Disconnect',
            SK: 'ConnectionId:FPiCDficIAMCERQ=|EventType:Disconnect',
            RoomCode: 'abc123',
            PK: 'abc123',
          },
        ] as unknown as dynamoClient.AnyEvent[]
        jest
          .spyOn(dynamoClient, 'listEventsForRoomCode')
          .mockResolvedValue(Events)
        const response = await dynamoClient.listConnected('RoomCode')
        expect(response.length).toBe(1)
        expect(response[0]).toStrictEqual({
          UserId: '75c3fcd0-f541-4215-bb13-c2112d069c19',
          Timestamp: '2021-09-06T13:27:30.425Z',
          ConnectionId: 'FPiSZff7IAMCJkQ=',
          EventType: 'Connect',
          SK: 'ConnectionId:FPiSZff7IAMCJkQ=|EventType:Connect',
          RoomCode: 'abc123',
          PK: 'abc123',
          UserName: 'Ben',
        })
      })
    })
  })
})
