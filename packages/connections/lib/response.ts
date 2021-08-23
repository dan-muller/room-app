class Response {
  constructor(public readonly statusCode: number, public readonly statusDescription?: string, public readonly headers?: Record<string, string>, public readonly cookies?: Record<string, string>) {
  }
}
export default Response

export class OK extends Response {
  constructor(headers?: Record<string, string>, cookies?: Record<string, string>) {
    super(200, "OK", headers, cookies)
  }
}