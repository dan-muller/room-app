
class _Error extends Error {
  constructor(name: string, message: string, comment?: string | null) {
    super(comment ? `${name}: ${message} ${comment}` : `${name}: ${message}`)
  }
}
export default _Error