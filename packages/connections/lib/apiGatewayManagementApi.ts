import { ApiGatewayManagementApi } from 'aws-sdk'

import logger from 'lib/logger'

namespace apiGatewayManagementApi {
  export const postToConnection = async (
    endpoint: string,
    params: ApiGatewayManagementApi.Types.PostToConnectionRequest
  ) => {
    logger.trace('api.postToConnection', { endpoint, params })
    const result = await new ApiGatewayManagementApi({ endpoint })
      .postToConnection(params, (err, data) => {
        if (data) logger.debug('api.postToConnection.data: ', data)
        if (err) logger.debug('api.postToConnection.err: ', err)
      })
      .promise()
    logger.trace('api.postToConnection', { result })
    return result
  }
}

export default apiGatewayManagementApi
