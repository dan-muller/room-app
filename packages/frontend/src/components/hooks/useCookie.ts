import Cookies, { CookieAttributes } from 'js-cookie'
import React from 'react'

const get = <T>(key: string) => {
  const value = Cookies.get(key)
  if (value) {
    return JSON.parse(value) as T
  }
  return undefined
}

const set = <T>(key: string, value: T, options?: CookieAttributes) => {
  Cookies.set(key, JSON.stringify(value), options)
  return value
}

const useCookie = <T = any>(
  key: string,
  initialValue: T | (() => T),
  initialOptions?: CookieAttributes
): [
  T,
  (dispatch: T | ((prevState: T) => T), options?: CookieAttributes) => void
] => {
  // Pass initial state function to useState so logic is only executed once
  const [current, setValue] = React.useState<T>(() => {
    let value = get<T>(key)
    if (value) {
      return value
    }
    if (typeof initialValue === 'function') {
      return set<T>(key, (initialValue as Function)(), initialOptions)
    }
    return set<T>(key, initialValue)
  })
  return [
    current,
    // Return a wrapped version of useState's setter function that persists the new value to localStorage.
    (dispatch, options) => {
      try {
        let value
        if (typeof dispatch === 'function') {
          value = (dispatch as Function)(current)
        } else {
          value = dispatch
        }
        setValue(value)
        set<T>(key, value, options)
      } catch (error) {
        console.log(error)
      }
    },
  ]
}

export default useCookie
