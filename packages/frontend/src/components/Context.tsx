import React from 'react'
import { v4 as uuid } from 'uuid'

import useCookie from 'components/hooks/useCookie'
import useLocalStorage from 'components/hooks/useLocalStorage'

type Context = { playerId: string }
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentionally naming the variable the same as the type
const Context = React.createContext<Context>({ playerId: 'xxxxx' })

export const Provider: React.FC = ({ children }) => {
  const [playerIdStored] = useLocalStorage('playerId', uuid)
  const [playerIdCookie] = useCookie('playerId', uuid)
  console.log({ playerIdStored, playerIdCookie })
  return (
    <Context.Provider value={{ playerId: playerIdCookie }}>
      {children}
    </Context.Provider>
  )
}
export const usePlayerId = () => React.useContext(Context).playerId
