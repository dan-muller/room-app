import React from 'react'
import { CookieAttributes } from 'js-cookie'
import { v4 as uuid } from 'uuid'

import useCookie from 'components/hooks/useCookie'
import useParams from './hooks/useParams'

type Context = {
  roomCode?: string
  userId: string
  userName?: string
}
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentionally naming the variable the same as the type
const Context = React.createContext<Context>({
  userId: 'xxxxx',
})

const options: CookieAttributes = {
  expires: 999999,
  httpOnly: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  secure: true,
}

export const Provider: React.FC = ({ children }) => {
  const { RoomCode, Name } = useParams()
  const [userId] = useCookie('UserId', uuid, options)
  return (
    <Context.Provider value={{ userId, roomCode: RoomCode, userName: Name }}>
      {children}
    </Context.Provider>
  )
}
export const useRoomCode = () => React.useContext(Context).roomCode
export const useUserId = () => React.useContext(Context).userId
export const useUserName = () => React.useContext(Context).userName
