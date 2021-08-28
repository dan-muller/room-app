import env from './env'

const LogLevel = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  critical: 5,
  none: 6,
}

namespace logger {
  export const currentLevel = () => {
    const level = env.get('LOG_LEVEL').toLowerCase()
    if (level === 'debug') return LogLevel['debug']
    if (level === 'error') return LogLevel['error']
    if (level === 'info') return LogLevel['info']
    if (level === 'trace') return LogLevel['trace']
    if (level === 'warn') return LogLevel['warn']
    if (level === 'critical') return LogLevel['critical']
    return LogLevel['none']
  }

  export const critical =
    currentLevel() <= LogLevel['critical'] ? console.error : () => {}
  export const debug =
    currentLevel() <= LogLevel['debug'] ? console.debug : () => {}
  export const error =
    currentLevel() <= LogLevel['error'] ? console.error : () => {}
  export const info =
    currentLevel() <= LogLevel['info'] ? console.info : () => {}
  export const trace =
    currentLevel() <= LogLevel['trace'] ? console.trace : () => {}
  export const warn =
    currentLevel() <= LogLevel['warn'] ? console.warn : () => {}
}

export default logger
