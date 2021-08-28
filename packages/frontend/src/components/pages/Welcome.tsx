import React from 'react'

import { Button } from 'components/atoms/Button'
import { Input } from 'components/atoms/Input'

const Welcome: React.FC<{ userName?: string; roomCode?: string }> = ({
  roomCode: roomCodeInitial = '',
  userName: userNameInitial = '',
}) => {
  const [roomCode, setRoomCode] = React.useState<string>(roomCodeInitial)
  const [userName, setUserName] = React.useState<string>(userNameInitial)
  return (
    <>
      <Input
        onChange={(e) => setRoomCode(e.target.value)}
        placeholder="Enter room code"
        value={roomCode}
      />
      <Input
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Enter name"
        value={userName}
      />
      <Button
        disabled={!roomCode || !userName}
        onClick={() => {
          if (userName && roomCode) {
            const RoomCode = escape(roomCode)
            const Name = escape(userName)
            document.location.search = `?RoomCode=${RoomCode}&Name=${Name}`
          }
        }}
      >
        Join
      </Button>
    </>
  )
}

export default Welcome
