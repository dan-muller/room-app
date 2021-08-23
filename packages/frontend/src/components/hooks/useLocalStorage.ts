import React from 'react'

const get = <T>(key: string) => {
  const value = window.localStorage.getItem(key)
  if (value) {
    return JSON.parse(value) as T
  }
  return undefined
}

const set = <T>(key: string, value: T) => {
  window.localStorage.setItem(key, JSON.stringify(value))
  return value
}

const useLocalStorage = <T = any>(
  key: string,
  initialValue: T | (() => T)
): [T, (dispatch: T | ((prevState: T) => T)) => void] => {
  // Pass initial state function to useState so logic is only executed once
  const [current, setValue] = React.useState<T>(() => {
    let value = get<T>(key)
    if (value) {
      return value
    }
    if (typeof initialValue === 'function') {
      return set<T>(key, (initialValue as Function)())
    }
    return set<T>(key, initialValue)
  })
  return [
    current,
    // Return a wrapped version of useState's setter function that persists the new value to localStorage.
    (dispatch) => {
      try {
        let value
        if (typeof dispatch === 'function') {
          value = (dispatch as Function)(current)
        } else {
          value = dispatch
        }
        setValue(value)
        set<T>(key, value)
      } catch (error) {
        console.log(error)
      }
    },
  ]
}

export default useLocalStorage
