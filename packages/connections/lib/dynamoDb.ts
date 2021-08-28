import { AWSError, DynamoDB } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'

import logger from 'lib/logger'

namespace dynamoDb {
  export const put = async (
    params: DynamoDB.DocumentClient.PutItemInput
  ): Promise<
    PromiseResult<DynamoDB.DocumentClient.PutItemOutput, AWSError>
  > => {
    logger.trace('dynamoDb.put.params', params)
    const result = await new DynamoDB.DocumentClient()
      .put(params, (err, data) => {
        if (data) logger.debug('dynamoDb.put.data:', data)
        if (err) logger.error('dynamoDb.put.err:', err)
      })
      .promise()
    logger.trace('dynamoDb.put.result', result)
    return result
  }

  export const query = async (
    params: DynamoDB.DocumentClient.QueryInput
  ): Promise<PromiseResult<DynamoDB.DocumentClient.QueryOutput, AWSError>> => {
    logger.trace('dynamoDb.query.params', params)
    const result = await new DynamoDB.DocumentClient()
      .query(params, (err, data) => {
        if (data) logger.debug('dynamoDb.query.data:', data)
        if (err) logger.error('dynamoDb.query.err:', err)
      })
      .promise()
    logger.trace('dynamoDb.query.result', result)
    return result
  }
}

export default dynamoDb
