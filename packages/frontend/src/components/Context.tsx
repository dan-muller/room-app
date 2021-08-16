import React from 'react'
import { v4 as uuid } from 'uuid'

import useCookie from 'components/hooks/useCookie'
import useLocalStorage from 'components/hooks/useLocalStorage'

type Context = {
  playerId: string
}

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
