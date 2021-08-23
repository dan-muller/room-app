import { BadRequestResponse, Response } from './response'


abstract class _Error extends Error {
  public abstract response: Response
  protected constructor(name: string, message: string, comment?: string | null) {
    super(comment ? `${name}: ${message} ${comment}` : `${name}: ${message}`)
  }
}

export class BadRequestError extends _Error {
  response = new BadRequestResponse(this.message)
  constructor(message: string, comment?: string | null) {
    super('Bad Request', message, comment)
  }
}