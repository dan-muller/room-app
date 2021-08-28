import { APIGatewayEvent, Handler } from 'aws-lambda'

import connect from 'actions/connect'
import disconnect from 'actions/disconnect'
import logger from 'lib/logger'
import sendMessage from 'actions/sendMessage'
import { BadRequestResponse, InternalServerErrorResponse } from 'lib/response'
import { conditionalList } from 'lib/lists'

export const Connect: Handler<APIGatewayEvent> = async (event) => {
  logger.info('Connect', event)

  const connectionId = event.requestContext.connectionId
  const roomCode = event.queryStringParameters?.RoomCode
  const userName = event.queryStringParameters?.Name

  if (connectionId && roomCode && userName) {
    try {
      return await connect(connectionId, roomCode, userName)
    } catch (e) {
      return new InternalServerErrorResponse(e.message)
    }
  }
  return new BadRequestResponse(
    conditionalList(
      'Missing request arguments',
      !connectionId && `Invalid connectionId value: ${connectionId}`,
      !roomCode && `Invalid roomCode value: ${roomCode}`,
      !userName && `Invalid userName value: ${userName}`
    ).join('. ')
  )
}

export const Disconnect: Handler<APIGatewayEvent> = async (event) => {
  logger.info('Disconnect', event)

  const connectionId = event.requestContext.connectionId

  if (connectionId) {
    try {
      return await disconnect(connectionId)
    } catch (e) {
      return new InternalServerErrorResponse(e.message)
    }
  }
  return new BadRequestResponse(
    conditionalList(
      'Missing request arguments',
      !connectionId && `Invalid connectionId value: ${connectionId}`
    ).join('. ')
  )
}

export const SendMessage: Handler<APIGatewayEvent> = async (event) => {
  logger.info('SendMessage', event)

  const connectionId = event.requestContext.connectionId
  const message = event.body

  if (connectionId && message) {
    try {
      return await sendMessage(connectionId, message)
    } catch (e) {
      return new InternalServerErrorResponse(e.message)
    }
  }
  return new BadRequestResponse(
    conditionalList(
      'Missing request arguments',
      !connectionId && `Invalid connectionId value: ${connectionId}`,
      !message && `Invalid message value: ${message}`
    ).join('. ')
  )
}
