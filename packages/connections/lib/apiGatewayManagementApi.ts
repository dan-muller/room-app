import { ApiGatewayManagementApi } from 'aws-sdk'

import logger from 'lib/logger'

namespace apiGatewayManagementApi {
  export const postToConnection = async (
    endpoint: string,
    params: ApiGatewayManagementApi.PostToConnectionRequest
  ) => {
    logger.debug('api.postToConnection', { endpoint, params })
    const result = await new ApiGatewayManagementApi({ endpoint })
      .postToConnection(params, (err, data) =>
        logger.trace('api.postToConnection', { data, err })
      )
      .promise()
    logger.debug('api.postToConnection', { result })
    return result
  }

  export const findConnection = async (
    endpoint: string,
    params: ApiGatewayManagementApi.GetConnectionRequest
  ) => {
    logger.debug('api.findConnection', { endpoint, params })
    const Connection = await new ApiGatewayManagementApi({ endpoint })
      .getConnection(params, (err, data) =>
        logger.trace('api.findConnection', { data, err })
      )
      .promise()
    logger.debug('api.findConnection', { Connection })
    return Connection
  }

  export const closeConnection = async (
    endpoint: string,
    params: ApiGatewayManagementApi.DeleteConnectionRequest
  ) => {
    logger.debug('api.closeConnection', { endpoint, params })
    const result = await new ApiGatewayManagementApi({ endpoint })
      .deleteConnection(params, (err, data) =>
        logger.trace('api.closeConnection', { data, err })
      )
      .promise()
    logger.debug('api.closeConnection', { result })
    return result
  }
}

export default apiGatewayManagementApi
