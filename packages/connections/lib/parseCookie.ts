import logger from './logger'

const parseCookie = (cookie?: string): { [key: string]: string } => {
  logger.trace('parseCookie', { cookie })
  const entries =
    cookie
      ?.split('; ')
      .map((param) => param.split('='))
      .filter(([key]) => key) ?? []
  logger.trace('parseCookie', { entries })
  const obj = Object.fromEntries(entries)
  logger.trace('parseCookie', { obj })
  return obj
}

export default parseCookie
