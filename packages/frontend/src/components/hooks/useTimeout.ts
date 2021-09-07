import React from 'react'

const useTimeout = (callback: () => void, delay: number) => {
  const timeoutRef = React.useRef(null)
  const savedCallback = React.useRef(callback)
  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])
  React.useEffect(() => {
    const tick = () => savedCallback.current()
    const timeout = window.setTimeout(tick, delay)
    return () => window.clearTimeout(timeout)
  }, [delay])
  return timeoutRef
}

export default useTimeout
