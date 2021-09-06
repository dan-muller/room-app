import React from 'react'
import styled from 'styled-components'
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'

const StyledChatWrapper = styled.div`
  align-content: center;
  background: white;
  color: black;
  display: inline-flex;
  flex-flow: column nowrap;
  flex-grow: 1;
  font-size: 16px;
  border-radius: 24px;
  padding: 16px;
  justify-content: start;
`

const StyledChatRow = styled.div`
  height: 36px;

  :not(:last-child) {
    margin-bottom: 8px;
  }
`

const StyledErrorMessage = styled.div``
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <StyledErrorMessage>{message}</StyledErrorMessage>
)

const StyledSystemMessage = styled.div`
  border-radius: 9999px;
  background: green;
  align-self: center;
`
const SystemMessage: React.FC<{ message: string }> = ({ message }) => (
  <StyledChatRow>
    <StyledSystemMessage>{message}</StyledSystemMessage>
  </StyledChatRow>
)

const StyledMessage = styled.div``
const Message: React.FC<{ message: string }> = ({ message }) => (
  <StyledMessage>{message}</StyledMessage>
)

const Chat: React.FC<{ events: LobbyEvent[] }> = ({ events }) => (
  <StyledChatWrapper>
    {events.map((event) => {
      switch (event.EventType) {
        case 'Error':
          return <ErrorMessage message={event.Message} />
        case 'System':
          return <SystemMessage message={event.Message} />
        default:
          return <Message message={event.Message} />
      }
    })}
  </StyledChatWrapper>
)

const StyledChatBar = styled.div`
  display: inline-flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin-bottom: 16px;
`

const ChatBar: React.FC<{ sendMessage: (message: string) => boolean }> = ({
  sendMessage,
}) => {
  const [message, setMessage] = React.useState<string>(
    'Hello WS, I have connected.'
  )
  const submit = React.useCallback(
    () => () => {
      const success = sendMessage(message)
      if (success) {
        console.debug('Message sent.')
        setMessage('')
      }
    },
    [message, sendMessage, setMessage]
  )
  return (
    <StyledChatBar>
      <Input
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
        style={{ flexGrow: 1 }}
        value={message}
      />
      <Button
        disabled={!message}
        onClick={() => submit()}
        style={{ marginLeft: '15px' }}
      >
        Send
      </Button>
    </StyledChatBar>
  )
}

const StyledLobbyComponent = styled.div`
  align-content: center;
  display: inline-flex;
  flex-flow: column nowrap;
  height: 100vh;
  justify-content: start;
  overflow: hidden;
  width: 600px;
`

const LobbyComponent: React.FC<{
  events: LobbyEvent[]
  sendMessage: (message: string) => boolean
}> = ({ events, sendMessage }) => {
  return (
    <StyledLobbyComponent>
      <ChatBar sendMessage={sendMessage} />
      <Chat events={events} />
    </StyledLobbyComponent>
  )
}

const useWebSocket = (
  url: string,
  handlers: {
    onClose: (event: CloseEvent) => void
    onError: (event: Event) => void
    onMessage: (event: MessageEvent) => void
    onOpen: (event: Event) => void
  }
): WebSocket | undefined => {
  const { onClose, onError, onMessage, onOpen } = handlers
  const ws = React.useMemo(() => new WebSocket(url), [url])
  React.useEffect(() => {
    const closeWs = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
    window.addEventListener('unload', closeWs)
    return () => {
      window.removeEventListener('unload', closeWs)
    }
  }, [ws])
  React.useEffect(() => {
    ws.onclose = onClose
  }, [ws, onClose])
  React.useEffect(() => {
    ws.onerror = onError
  }, [ws, onError])
  React.useEffect(() => {
    ws.onmessage = onMessage
  }, [ws, onMessage])
  React.useEffect(() => {
    ws.onopen = onOpen
  }, [ws, onOpen])

  return ws
}

const useWebSocketUrl = (name: string, roomCode: string) => {
  const url = React.useMemo(
    () => `wss://${window.location.host}/ws/?RoomCode=${roomCode}&Name=${name}`,
    [roomCode, name]
  )
  console.debug('WS URL:', url)
  return url
}

type LobbyErrorEvent = { EventType: 'Error'; Message: string }
type LobbySystemEvent = { EventType: 'System'; Message: string }
type LobbyUserEvent = { EventType: 'User'; Message: string }
type LobbyEvent =
  | LobbyErrorEvent
  | LobbySystemEvent
  | LobbyUserEvent
  | { EventType: string; Message: string; UserName: string | 'unknown' }
const errorEvent = (Message: string): LobbyErrorEvent => ({
  EventType: 'Error',
  Message,
})
const systemEvent = (Message: string): LobbySystemEvent => ({
  EventType: 'System',
  Message,
})

const useEvents = () => {
  const [events, setEvents] = React.useState<LobbyEvent[]>([
    {
      EventType: 'System',
      Message: 'Messages will show up here!',
    },
  ])
  const addEvent = React.useCallback<(event: LobbyEvent) => void>(
    (event) => {
      setEvents([...events, event])
    },
    [events, setEvents]
  )
  return { events, addEvent }
}

const LobbyContainer: React.FC<{ userName: string; roomCode: string }> = ({
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
          return true
        } catch (e) {
          console.error('Can not send message. Error: ', e)
        }
      }
      return false
    },
    [ws]
  )
  return <LobbyComponent sendMessage={sendMessage} events={events} />
}

export default LobbyContainer
