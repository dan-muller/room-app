import Cookies, { CookieAttributes } from 'js-cookie'
import React from 'react'

const get = (key: string) => Cookies.get(key)

const set = (key: string, value: string, options?: CookieAttributes) =>
  Cookies.set(key, value, options) ?? value

const useCookie = (
  key: string,
  initialValue: string | (() => string),
  initialOptions?: CookieAttributes,
): [
  string,
  (dispatch: string | ((prevState: string) => string), options?: CookieAttributes) => void
] => {
  // Pass initial state function to useState so logic is only executed once
  const [current, setValue] = React.useState(() => {
    let value = get(key)
    if (value) {
      return value
    }
    if (typeof initialValue === 'function') {
      return set(key, (initialValue as Function)(), initialOptions)
    }
    return set(key, initialValue)
  })
  return [
    current,
    // Return a wrapped version of useState's setter function that persists the new value to Cookies.
    (dispatch, options) => {
      try {
        let value
        if (typeof dispatch === 'function') {
          value = (dispatch as Function)(current)
        } else {
          value = dispatch
        }
        setValue(value)
        set(key, value, options)
      } catch (error) {
        console.log(error)
      }
    },
  ]
}

export default useCookie
