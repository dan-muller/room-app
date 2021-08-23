export const conditionalList = <T>(...elements: (T | false)[]): T[] =>
  elements.reduce((arr, element) => (element ? [...arr, element] : arr), [] as T[])