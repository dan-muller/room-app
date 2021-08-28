import env from './env'

const LogLevel = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  critical: 5,
}

const currentLevel = () => {
  const level = env.get('LOG_LEVEL').toLowerCase()
  if (level === 'debug') return LogLevel['debug']
  if (level === 'error') return LogLevel['error']
  if (level === 'info') return LogLevel['info']
  if (level === 'trace') return LogLevel['trace']
  if (level === 'warn') return LogLevel['warn']
  return LogLevel['critical']
}

const logger = {
  critical: currentLevel() >= LogLevel['critical'] ? console.error : () => {},
  debug: currentLevel() >= LogLevel['debug'] ? console.debug : () => {},
  error: currentLevel() >= LogLevel['error'] ? console.error : () => {},
  info: currentLevel() >= LogLevel['info'] ? console.info : () => {},
  trace: currentLevel() >= LogLevel['trace'] ? console.trace : () => {},
  warn: currentLevel() >= LogLevel['warn'] ? console.warn : () => {},
}

export default logger
