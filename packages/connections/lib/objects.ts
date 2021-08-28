export const deleteFrom = <T>(
  obj: { [key: string]: T },
  predicate: (value: T) => unknown
): { [key: string]: T } =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => predicate(value))
  )
