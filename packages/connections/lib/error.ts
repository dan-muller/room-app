import Response from './response'


abstract class _Error extends Error {
  public abstract response: Response
  protected headers: Record<string, string> = {}
  protected cookies: Record<string, string> = {}
  protected constructor(name: string, message: string, comment?: string | null) {
    super(comment ? `${name}: ${message} ${comment}` : `${name}: ${message}`)
  }
}

export class BadRequest extends _Error {
  response = new Response(400, this.message, this.headers, this.cookies)
  constructor(message: string, comment?: string | null) {
    super('Bad Request', message, comment)
  }
}