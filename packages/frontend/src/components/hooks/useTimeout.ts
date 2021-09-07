import React from 'react'

const useTimeout = (
  callback: () => void,
  delay: number,
  deps?: ReadonlyArray<any>
) => {
  const timeoutRef = React.useRef(null)
  const savedCallback = React.useRef(callback)
  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])
  React.useEffect(
    () => {
      const tick = () => savedCallback.current()
      const timeout = window.setTimeout(tick, delay)
      return () => window.clearTimeout(timeout)
    },
    deps ? [...deps, delay] : [delay]
  )
  return timeoutRef
}

export default useTimeout
