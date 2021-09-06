import api from 'lib/apiGatewayManagementApi'
import env from 'lib/env'
import logger from '../lib/logger'

namespace connections {
  const endpoint: string = env.get('ENDPOINT')
  if (env.get('NODE_ENV') === 'production' && !endpoint) {
    throw new Error('The environment variable ENDPOINT must be set.')
  }

  export const publishEvent = async (ConnectionIds: string[], Event: any) => {
    console.debug('connections.publishEvent', { ConnectionIds, Event })
    const PublishEvents = await Promise.all(
      ConnectionIds.map(async (ConnectionId) => {
        try {
          const PostEvent = await api.postToConnection(endpoint, {
            ConnectionId,
            Data: Buffer.from(JSON.stringify({ Event })),
          })
          logger.trace('connections.publishEvent', { ConnectionId, PostEvent })
          return PostEvent
        } catch (Error) {
          logger.trace('connections.publishEvent', { ConnectionId, Error })
          return { ConnectionId, Error }
        }
      })
    )
    console.debug('connections.publishEvent', { ConnectionIds, PublishEvents })
    return PublishEvents
  }
}

export default connections
