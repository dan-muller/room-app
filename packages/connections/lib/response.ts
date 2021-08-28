import logger from './logger'

export abstract class Response {
  protected constructor(
    public readonly statusCode: number,
    public readonly body?: string
  ) {
    logger.info(this)
  }
}

export class OKResponse extends Response {
  constructor(body?: string) {
    super(200, body)
  }
}

export class BadRequestResponse extends Response {
  constructor(body?: string) {
    super(400, body)
  }
}

export class InternalServerErrorResponse extends Response {
  constructor(body?: string) {
    super(500, body)
  }
}
