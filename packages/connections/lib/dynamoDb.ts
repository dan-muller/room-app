import { AWSError, DynamoDB } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'

import logger from 'lib/logger'

namespace dynamoDb {
  export const get = (
    params: DynamoDB.DocumentClient.GetItemInput
  ): Promise<PromiseResult<DynamoDB.DocumentClient.GetItemOutput, AWSError>> =>
    new DynamoDB.DocumentClient()
      .get(params, (err, data) => {
        data && logger.debug('dynamoDb get data:', data)
        err && logger.debug('dynamoDb get err:', err)
      })
      .promise()

  export const put = (
    params: DynamoDB.DocumentClient.PutItemInput
  ): Promise<PromiseResult<DynamoDB.DocumentClient.PutItemOutput, AWSError>> =>
    new DynamoDB.DocumentClient()
      .put(params, (err, data) => {
        data && logger.debug('dynamoDb put data:', data)
        err && logger.debug('dynamoDb put err:', err)
      })
      .promise()

  export const query = (
    params: DynamoDB.DocumentClient.QueryInput
  ): Promise<PromiseResult<DynamoDB.DocumentClient.QueryOutput, AWSError>> =>
    new DynamoDB.DocumentClient()
      .query(params, (err, data) => {
        data && logger.debug('dynamoDb query data:', data)
        err && logger.debug('dynamoDb query err:', err)
      })
      .promise()
}

export default dynamoDb
