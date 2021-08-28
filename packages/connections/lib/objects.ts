import logger from './logger'

export const deleteFrom = <T>(
  obj: { [key: string]: T },
  predicate: (value: T) => unknown
): { [key: string]: T } => {
  logger.trace('deleteFrom.obj', obj)
  const entries = Object.entries(obj).filter(([, value]) => predicate(value))
  logger.trace('deleteFrom.entries', entries)
  const result = Object.fromEntries(entries)
  logger.trace('deleteFrom.result', result)
  return result
}
