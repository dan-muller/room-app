import { OKResponse, Response } from './lib/response'

export const connect = async (connectionId: string, roomCode: string, userId: string, userName: string): Promise<Response> => {
  return new OKResponse(JSON.stringify({ connectionId, roomCode, userId, userName }))
}

export const disconnect = async (connectionId: string): Promise<Response> => {
  return new OKResponse(JSON.stringify({ connectionId }))
}

export const sendMessage = async (connectionId: string, message: string): Promise<Response> => {
  return new OKResponse(JSON.stringify({ connectionId, message }))
}