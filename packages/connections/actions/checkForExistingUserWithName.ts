import connections from 'clients/connections'
import dynamo from 'clients/dynamo'
import logger from 'lib/logger'

export const checkForExistingUserWithName = async (
  events: dynamo.ConnectEvent[],
  userName: string
) => {
  logger.info('connect.checkForExistingUserWithName', {
    events,
    userName,
  })
  const existingUserWithSameName = events.find(
    (event) => event.UserName === userName
  )
  logger.info('connect.checkForExistingUserWithName', {
    existingUserWithSameName,
  })
  if (existingUserWithSameName?.ConnectionId) {
    const hasMetTimeout = await connections.checkTimeout(
      existingUserWithSameName.ConnectionId
    )
    logger.info('connect.checkForExistingUserWithName', {
      hasMetTimeout,
    })
    if (hasMetTimeout) {
      const disconnectEvent = await dynamo.createDisconnectEvent(
        existingUserWithSameName.ConnectionId,
        existingUserWithSameName.RoomCode,
        true
      )
      logger.info('connect.checkForExistingUserWithName', {
        check: false,
        disconnectEvent,
      })
      return false
    }
    logger.info('connect.checkForExistingUserWithName', {
      check: true,
    })
    return true
  }
  logger.info('connect.checkForExistingUserWithName', {
    check: false,
  })
  return false
}
