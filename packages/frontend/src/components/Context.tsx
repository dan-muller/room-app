import React from 'react'
import { v4 as uuid } from 'uuid'

import useCookie from 'components/hooks/useCookie'
import useParams from './hooks/useParams'

type Context = {
  name?: string
  roomCode?: string
  userId: string
}
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentionally naming the variable the same as the type
const Context = React.createContext<Context>({
  userId: 'xxxxx',
})

export const Provider: React.FC = ({ children }) => {
  const { RoomCode, Name } = useParams()
  const [userId] = useCookie('UserId', uuid, { expires: 999999 })
  const [temp] = useCookie('Temp', uuid, { expires: 999999 })
  console.log(temp)
  return (
    <Context.Provider value={{ userId, roomCode: RoomCode, name: Name }}>
      {children}
    </Context.Provider>
  )
}
export const useRoomCode = () => React.useContext(Context).roomCode
export const useUserId = () => React.useContext(Context).userId
export const useUserName = () => React.useContext(Context).name
