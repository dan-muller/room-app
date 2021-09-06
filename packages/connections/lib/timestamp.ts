namespace timestamp {
  export type Timestamp = ReturnType<typeof now>

  export const now = () => new Date().toISOString()

  export const from = (value: number | string) => new Date(value).toISOString()

  export const compare = (a: string, b: string) =>
    new Date(a).getTime() - new Date(b).getTime()
}

export default timestamp
