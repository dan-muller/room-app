import Cookies from 'js-cookie'
import faker from 'faker'
import { act } from 'react-dom/test-utils'
import { renderHook } from '@testing-library/react-hooks'

import useCookie from 'components/hooks/useCookie'

describe('useCookie', () => {
  beforeEach(function () {
    let store: { [key: string]: string } = {}
    jest
      .spyOn(Object.getPrototypeOf(Cookies), 'get')
      .mockImplementation((key) => store[key as string])
    jest
      .spyOn(Object.getPrototypeOf(Cookies), 'set')
      .mockImplementation(
        (key, value) => (store[key as string] = JSON.stringify(value))
      )
  })

  it('should set initial value', () => {
    const key = faker.lorem.word()
    const initialValue = faker.lorem.word()

    const { result } = renderHook(() => useCookie(key, initialValue))
    const [value] = result.current

    expect(value).toBe(initialValue)
  })

  it('should call initial value function when passed', () => {
    const key = faker.lorem.word()
    const initialValue = faker.lorem.word()
    const initialValueFn = jest.fn(() => initialValue)

    renderHook(() => useCookie(key, initialValueFn))

    expect(initialValueFn).toHaveBeenCalledTimes(1)
    expect(initialValueFn).lastReturnedWith(initialValue)
  })

  it('should set next value when update fn is called', () => {
    const key = faker.lorem.word()
    const initialValue = faker.lorem.word()
    const nextValue = faker.lorem.word()

    const { result } = renderHook(() => useCookie(key, initialValue))
    const [_, setValue] = result.current
    act(() => setValue(nextValue))

    const [actualValue] = result.current
    expect(actualValue).toBe(nextValue)
  })

  it('should call next value fn when update fn is called', () => {
    const key = faker.lorem.word()
    const initialValue = faker.lorem.word()
    const nextValue = faker.lorem.word()
    const nextValueFn = jest.fn(() => nextValue)

    const { result } = renderHook(() => useCookie(key, initialValue))
    const [_, setValue] = result.current
    act(() => setValue(nextValueFn))

    const [actualValue] = result.current
    expect(actualValue).toBe(nextValue)
    expect(nextValueFn).toHaveBeenCalledTimes(1)
    expect(nextValueFn).lastCalledWith(initialValue)
    expect(nextValueFn).lastReturnedWith(nextValue)
  })

  it('should work for objects', () => {
    type T = {
      name: string
      count: number
    }
    const getT = (): T => ({
      count: faker.datatype.number(900) + 100,
      name: faker.lorem.word(),
    })

    const key = faker.lorem.word()
    const initialValue: T = getT()
    const nextValue: T = getT()

    const { result } = renderHook(() => useCookie(key, initialValue))
    const [_, setValue] = result.current
    act(() => setValue(nextValue))

    const [actualValue] = result.current
    expect(actualValue).toBe(nextValue)
  })
})
