namespace timestamp {
  export type Timestamp = ReturnType<typeof now>
  export const now = () => new Date().toISOString()
  export const compare = (a: string, b: string) =>
    new Date(a).getMilliseconds() - new Date(b).getMilliseconds()
}

export default timestamp
