import api from 'lib/apiGatewayManagementApi'
import env from 'lib/env'

namespace eventsClient {
  const endpoint: string = env.get('ENDPOINT')
  if (env.get('NODE_ENV') === 'production' && !endpoint) {
    throw new Error('The environment variable ENDPOINT must be set.')
  }

  export const publishEvent = async (ConnectionIds: string[], Event: any) => {
    console.trace('connections.publishEvent', { ConnectionIds, Event })
    const Publish = await Promise.all(
      ConnectionIds.map((ConnectionId) => {
        api.postToConnection(endpoint, {
          ConnectionId,
          Data: Buffer.from(JSON.stringify({ Event })),
        })
      })
    )
    console.trace('connections.publishEvent', { Publish })
    return Publish
  }
}

export default eventsClient
