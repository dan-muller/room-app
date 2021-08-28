import { ApiGatewayManagementApi } from 'aws-sdk'

import logger from 'lib/logger'

namespace apiGatewayManagementApi {
  export const postToConnection = (
    endpoint: string,
    params: ApiGatewayManagementApi.Types.PostToConnectionRequest
  ) => {
    logger.trace('api.postToConnection.endpoint', endpoint)
    logger.trace('api.postToConnection.params', params)
    const result = new ApiGatewayManagementApi({ endpoint })
      .postToConnection(params, (err, data) => {
        if (data) logger.debug('api.postToConnection.data: ', data)
        if (err) logger.debug('api.postToConnection.err: ', err)
      })
      .promise()
    logger.trace('api.postToConnection.result', result)
    return result
  }
}

export default apiGatewayManagementApi
