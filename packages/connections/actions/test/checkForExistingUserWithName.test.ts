import faker from 'faker'

import connections from 'clients/connections'
import dynamo from 'clients/dynamo'

import { checkForExistingUserWithName } from '../checkForExistingUserWithName'

describe('checkForExistingUserWithName', () => {
  it('should return false when there is not an event with the same user name', async () => {
    jest.spyOn(connections, 'checkTimeout').mockResolvedValue(true)
    const events = [
      {
        ConnectionId: faker.datatype.uuid(),
        UserName: faker.name.firstName(),
      },
    ] as dynamo.ConnectEvent[]
    const check = await checkForExistingUserWithName(
      events,
      faker.name.firstName()
    )
    expect(check).toBeFalsy()
  })

  it('should return false when there is an event with the same user name but the connection has timed out', async () => {
    jest.spyOn(connections, 'checkTimeout').mockResolvedValue(true)
    jest
      .spyOn(dynamo, 'createDisconnectEvent')
      .mockResolvedValue({} as dynamo.DisconnectEvent)
    const userName = faker.name.firstName()
    const events = [
      { ConnectionId: faker.datatype.uuid(), UserName: userName },
    ] as dynamo.ConnectEvent[]
    const check = await checkForExistingUserWithName(events, userName)
    expect(check).toBeFalsy()
  })

  it('should return true when there is an event with the same user name but the connection has not timed out', async () => {
    jest.spyOn(connections, 'checkTimeout').mockResolvedValue(false)
    const userName = faker.name.firstName()
    const events = [
      { ConnectionId: faker.datatype.uuid(), UserName: userName },
    ] as dynamo.ConnectEvent[]
    const check = await checkForExistingUserWithName(events, userName)
    expect(check).toBeTruthy()
  })
})
