import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { dynamo } from '../actions'

describe('dynamo', () => {
  it('works', () => {
    jest.spyOn(dynamo, 'getTableName').mockReturnValue('')
    const mockClientPutFn = jest.fn()
    jest.spyOn(dynamo, 'getClient').mockReturnValue({
      put: mockClientPutFn,
      promise: () => Promise.resolve(),
    } as unknown as DocumentClient)
    const connectionId = 'connectionId'
    const roomCode = 'roomCode'
    const userId = 'userId'
    const userName = 'userName'
    const a = dynamo.createConnectEvent(
      connectionId,
      roomCode,
      userId,
      userName
    )
    console.log(a)
  })
})
