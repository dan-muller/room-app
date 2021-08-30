import api from 'lib/apiGatewayManagementApi'
import env from 'lib/env'
import logger from 'lib/logger'
import timestamp from 'lib/timestamp'

namespace eventsClient {
  const endpoint: string = env.get('ENDPOINT')
  if (env.get('NODE_ENV') === 'production' && !endpoint) {
    throw new Error('The environment variable ENDPOINT must be set.')
  }
  const timeout: number = parseInt(env.get('CONNECTION_TIMEOUT'))
  if (env.get('NODE_ENV') === 'production' && !timeout) {
    throw new Error('The environment variable CONNECTION_TIMEOUT must be set.')
  }

  export const publishEvent = async (ConnectionIds: string[], Event: any) => {
    console.log('connections.publish', { ConnectionIds, Event })
    const Events = await Promise.all(
      ConnectionIds.map((ConnectionId) => {
        if (!checkTimeout(ConnectionId)) {
          api.postToConnection(endpoint, {
            ConnectionId,
            Data: Buffer.from(JSON.stringify({ Event })),
          })
        }
      })
    )
    console.log('connections.publish', { Events })
    return Events
  }

  export const checkTimeout = async (
    ConnectionId: string,
    TimeoutMillis: number = timeout
  ) => {
    logger.trace('connections.checkTimeout', {
      ConnectionId,
      TimeoutMillis,
    })
    try {
      const Connection = await api.findConnection(endpoint, { ConnectionId })
      logger.trace('connections.checkTimeout', { Connection })
      if (Connection.LastActiveAt) {
        const TimeSinceLastActive = timestamp.compare(
          Connection.LastActiveAt.toISOString(),
          timestamp.now()
        )
        logger.trace('connections.checkTimeout', {
          TimeSinceLastActive,
          Check: TimeSinceLastActive <= TimeoutMillis,
        })
        if (TimeSinceLastActive <= TimeoutMillis) {
          return false
        }
      }
    } catch (e) {
      logger.trace('connections.checkTimeout', e)
    }
    return true
  }
}

export default eventsClient
