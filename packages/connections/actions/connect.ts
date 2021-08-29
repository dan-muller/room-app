import connections from 'clients/connections'
import dynamo from 'clients/dynamo'
import logger from 'lib/logger'
import { BadRequestResponse, OKResponse, Response } from 'lib/response'
import env from 'lib/env'

export const checkForExistingUserWithName = async (
  events: dynamo.ConnectEvent[],
  userName: string
) => {
  logger.trace('connect.checkForExistingUserWithName', {
    events,
    userName,
  })
  const existingUserWithSameName = events.find(
    (event) => event.UserName === userName
  )
  logger.trace('connect.checkForExistingUserWithName', {
    existingUserWithSameName,
  })
  if (existingUserWithSameName?.ConnectionId) {
    const hasMetTimeout = await connections.checkTimeout(
      existingUserWithSameName.ConnectionId,
      parseInt(env.get('CONNECTION_TIMEOUT'))
    )
    logger.trace('connect.checkForExistingUserWithName', {
      hasMetTimeout,
    })
    if (hasMetTimeout) {
      const disconnectEvent = await dynamo.createDisconnectEvent(
        existingUserWithSameName.ConnectionId,
        existingUserWithSameName.RoomCode,
        true
      )
      logger.trace('connect.checkForExistingUserWithName', {
        check: false,
        disconnectEvent,
      })
      return false
    }
    logger.trace('connect.checkForExistingUserWithName', {
      check: true,
    })
    return true
  }
  logger.trace('connect.checkForExistingUserWithName', {
    check: false,
  })
  return false
}

const connect = async (
  connectionId: string,
  roomCode: string,
  userName: string
): Promise<Response> => {
  logger.trace('connect', { connectionId, roomCode, userName })

  const connectedEvents = await dynamo.listConnected(roomCode)
  const connectionIds = connectedEvents.map((event) => event.ConnectionId)
  logger.trace('connect', { connectedEvents, connectionIds })

  const existingUserWithName = await checkForExistingUserWithName(
    connectedEvents,
    userName
  )
  if (existingUserWithName) {
    return new BadRequestResponse(
      `Cannot connect to room. The name "${userName}" has already been taken.`
    )
  }

  const connectEvent = await dynamo.createConnectEvent(
    connectionId,
    roomCode,
    userName
  )
  logger.trace('connect', { connectEvent })

  const publishEvent = await connections.publishEvent(
    connectionIds,
    connectEvent
  )
  logger.trace('connect', { publishEvent })

  return new OKResponse(JSON.stringify({ connectEvent, publishEvent }))
}

export default connect
