import env from 'lib/env'
import api from 'lib/apiGatewayManagementApi'

namespace eventsClient {
  const Endpoint = env.get('ENDPOINT')
  if (env.get('NODE_ENV') === 'production' && !Endpoint) {
    throw new Error('The environment variable ENDPOINT must be set.')
  }

  export const publish = async (ConnectionIds: string[], Event: any) => {
    const Events = await Promise.all(
      ConnectionIds.map((ConnectionId) =>
        api.postToConnection(Endpoint, {
          ConnectionId,
          Data: Buffer.from(JSON.stringify({ Event })),
        })
      )
    )
    console.log('events.publish', { Events })
    return Events
  }
}

export default eventsClient
