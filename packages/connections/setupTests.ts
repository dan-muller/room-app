// @ts-ignore
jest.mock('lib/logger', () => ({
  critical: () => {},
  debug: () => {},
  error: () => {},
  info: () => {},
  trace: () => {},
  warn: () => {},
}))
