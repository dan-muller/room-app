const parseCookie = (Cookie?: string): { [key: string]: string } =>
  Object.fromEntries(
    Cookie?.split('; ')
      .map((param) => param.split('='))
      .filter(([key]) => key) ?? []
  )

export default parseCookie
