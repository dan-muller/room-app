import { ApiGatewayManagementApi } from 'aws-sdk'

import logger from 'lib/logger'

namespace apiGatewayManagementApi {
  export const postToConnection = (
    endpoint: string,
    params: ApiGatewayManagementApi.Types.PostToConnectionRequest
  ) =>
    new ApiGatewayManagementApi({ endpoint })
      .postToConnection(params, (err, data) => {
        data && logger.debug('api postToConnection data: ', data)
        err && logger.debug('api postToConnection err: ', err)
      })
      .promise()
}

export default apiGatewayManagementApi
