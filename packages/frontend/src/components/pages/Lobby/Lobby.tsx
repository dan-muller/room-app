import React from 'react'
import styled from 'styled-components'

import Chat from './Chat'
import ChatBar from './ChatBar'
import useEvents, { errorEvent, systemEvent, userEvent } from './useEvents'
import { useWebSocket, useWebSocketUrl } from './useWebSocket'

const StyledLobby = styled.div`
  align-content: center;
  display: inline-flex;
  flex-flow: column nowrap;
  height: 100vh;
  justify-content: start;
  overflow: hidden;
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
    onMessage: ({ data }) => addEvent(JSON.parse(data)),
    onOpen: () => addEvent(systemEvent('You have connected.')),
  })
  const sendMessage = React.useCallback(
    (message: string) => {
      if (message && ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message)
          addEvent(userEvent(message))
          return true
        } catch (e) {
          console.error('Can not send message. Error: ', e)
        }
      }
      return false
    },
    [ws]
  )
  return (
    <StyledLobby>
      <ChatBar sendMessage={sendMessage} />
      <Chat events={events} />
    </StyledLobby>
  )
}

export default Lobby
