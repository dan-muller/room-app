import { ApiGatewayManagementApi } from 'aws-sdk'

import * as DynamoClient from 'clients/dynamo'

const Endpoint = process.env.ENDPOINT
if (!Endpoint) {
  throw new Error('The environment variable ENDPOINT must be set.')
}
const Api = new ApiGatewayManagementApi({
  endpoint: process.env.ENDPOINT,
})

export const postToConnections = async (
  Connections: DynamoClient.Connection[],
  Event: any
) => {
  const PostToConnections = Promise.all(
    Connections.map(async ({ ConnectionId }) =>
      Api.postToConnection(
        {
          ConnectionId,
          Data: Buffer.from(JSON.stringify({ Event })),
        },
        (err, data) => {
          console.log('PostToConnections err:', err)
          console.log('ApiClient PostToConnections data:', data)
        }
      )
        .promise()
        .then(
          (data) => {
            console.log('PostToConnections then data:', data)
          },
          (reason) => console.error('Failed to post to connections: ', reason)
        )
    )
  )

  console.log({
    Api,
    PostToConnections: await PostToConnections,
  })

  return await PostToConnections
}
