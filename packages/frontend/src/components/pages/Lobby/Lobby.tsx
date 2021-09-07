import React from 'react'
import styled from 'styled-components'

import Chat from './Chat'
import ChatBar from './ChatBar'
import useEvents, {
  errorEvent,
  parseEvent,
  systemEvent,
  userEvent,
} from './useEvents'
import { useWebSocket, useWebSocketUrl } from './useWebSocket'

const StyledLobby = styled.div`
  align-content: center;
  display: inline-flex;
  flex-flow: column nowrap;
  height: 100vh;
  width: 600px;
`

const Lobby: React.FC<{ userName: string; roomCode: string }> = ({
  userName,
  roomCode,
}) => {
  const { events, addEvent } = useEvents()

  const url = useWebSocketUrl(userName, roomCode)
  const ws = useWebSocket(url, {
    onClose: () => addEvent(systemEvent('You have disconnected.')),
    onError: () => addEvent(errorEvent('An error has occurred.')),
    onMessage: ({ data }) => addEvent(parseEvent(JSON.parse(data))),
    onOpen: () => addEvent(systemEvent('You have connected.')),
  })
  const sendMessage = (message: string) => {
    if (!message) {
      return false
    }
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      addEvent(errorEvent('You can not send messages right now.'))
      return false
    }
    ws.send(message)
    addEvent(userEvent(message))
    return true
  }
  return (
    <StyledLobby>
      <ChatBar sendMessage={sendMessage} />
      <Chat events={events} />
    </StyledLobby>
  )
}

export default Lobby
