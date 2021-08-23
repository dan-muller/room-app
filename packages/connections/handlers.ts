import { APIGatewayEvent, Handler } from 'aws-lambda'

import logger from 'lib/logger'
import parseCookie from 'lib/parseCookie'
import { BadRequestResponse, InternalServerErrorResponse } from 'lib/response'
import { conditionalList } from 'lib/list'
import { connect, disconnect, sendMessage } from 'actions'

export const Connect: Handler<APIGatewayEvent> = async (event) => {
  logger.log("Connect", event)

  const connectionId = event.requestContext.connectionId
  const roomCode = event.queryStringParameters?.RoomCode
  const { UserId: userId } = parseCookie(event.headers?.Cookie ?? '')
  const userName = event.queryStringParameters?.Name

  if (connectionId && roomCode && userId && userName) {
    try {
      return await connect(connectionId, roomCode, userId, userName)
    } catch (e) {
      return new InternalServerErrorResponse(e.message)
    }
  } else {
    return new BadRequestResponse(conditionalList(
      'Missing request arguments',
      !connectionId && `Invalid connectionId value: ${connectionId}`,
      !roomCode && `Invalid roomCode value: ${roomCode}`,
      !userId && `Invalid userId value: ${userId}`,
      !userName && `Invalid userName value: ${userName}`,
    ).join('. '))
  }
}

export const Disconnect: Handler<APIGatewayEvent> = async (event) => {
  logger.log("Disconnect", event)

  const connectionId = event.requestContext.connectionId

  if (connectionId) {
    try {
      return await disconnect(connectionId)
    } catch (e) {
      return new InternalServerErrorResponse(e.message)
    }
  } else {
    return new BadRequestResponse(conditionalList(
      'Missing request arguments',
      !connectionId && `Invalid connectionId value: ${connectionId}`,
    ).join('. '))
  }
}

export const SendMessage: Handler<APIGatewayEvent> = async (event) => {
  logger.log("SendMessage", event)

  const connectionId = event.requestContext.connectionId
  const message = event.body

  if (connectionId && message) {
    try {
      return await sendMessage(connectionId, message)
    } catch (e) {
      return new InternalServerErrorResponse(e.message)
    }
  } else {
    return new BadRequestResponse(conditionalList(
      'Missing request arguments',
      !connectionId && `Invalid connectionId value: ${connectionId}`,
      !message && `Invalid message value: ${message}`,
    ).join('. '))
  }
}