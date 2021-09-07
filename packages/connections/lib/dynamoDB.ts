import { AWSError, DynamoDB } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'

import logger from 'lib/logger'

namespace dynamoDB {
  export const put = async (
    params: DynamoDB.DocumentClient.PutItemInput
  ): Promise<
    PromiseResult<DynamoDB.DocumentClient.PutItemOutput, AWSError>
  > => {
    logger.debug('dynamoDB.put', { params })
    const result = await new DynamoDB.DocumentClient()
      .put(params, (err, data) => logger.trace('dynamoDB.put', { data, err }))
      .promise()
    logger.debug('dynamoDB.put', { result })
    return result
  }

  export const query = async (
    params: DynamoDB.DocumentClient.QueryInput
  ): Promise<PromiseResult<DynamoDB.DocumentClient.QueryOutput, AWSError>> => {
    logger.debug('dynamoDB.query', { params })
    const result = await new DynamoDB.DocumentClient()
      .query(params, (err, data) =>
        logger.trace('dynamoDB.query', { data, err })
      )
      .promise()
    logger.debug('dynamoDB.query', { result })
    return result
  }
}

export default dynamoDB
