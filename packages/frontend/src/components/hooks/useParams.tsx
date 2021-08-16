const useParams = (): Record<string, string | undefined> =>
  Object.fromEntries(
    window.location.search
      .replace('?', '')
      .split('&')
      .map((param) => param.split('='))
      .filter(([key]) => key)
  )

export default useParams
