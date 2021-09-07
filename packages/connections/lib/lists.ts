export const conditionalList = <T>(...elements: (T | false)[]): T[] =>
  elements.reduce(
    (arr, element) => (element ? [...arr, element] : arr),
    [] as T[]
  )

export const isNotNull = <T>(x: T): x is NonNullable<T> => x !== null

export const ArrayList = <T>(elements: T[], extra?: T): T[] =>
  extra ? ArrayList([...elements, extra]) : [...new Set<T>(elements)]
