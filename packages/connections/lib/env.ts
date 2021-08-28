namespace env {
  type EnvVarStr =
    | 'CONNECTIONS_TABLE_NAME'
    | 'ENDPOINT'
    | 'LOG_LEVEL'
    | 'NODE_ENV'
  export const get = (
    key: EnvVarStr,
    defaultValue?: string | (() => string)
  ) => {
    if (process.env[key]) {
      return process.env[key]
    }
    if (typeof defaultValue === 'function') {
      return (defaultValue as Function)()
    }
    return defaultValue
  }
}

export default env
