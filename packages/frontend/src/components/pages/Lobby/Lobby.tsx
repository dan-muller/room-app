import React from 'react'

import { Button } from 'components/atoms/Button'
import { Input } from 'components/atoms/Input'

type Message = string

const LobbyComponent: React.FC<{ sendMessage: (message: Message) => boolean }> =
  ({ sendMessage }) => {
    const [message, setMessage] = React.useState<string>(
      'Hello WS, I have connected.'
    )
    return (
      <>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message"
        />
        <Button
          disabled={!message}
          onClick={() => {
            const success = sendMessage(message)
            if (success) {
              console.debug('Message sent.')
              setMessage('')
            }
          }}
        >
          Send
        </Button>
      </>
    )
  }

const useWebSocket = (url: string): WebSocket | undefined => {
  try {
    const ws = new WebSocket(url)

    const closeWs = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
    window.addEventListener('unload', closeWs)
    window.onbeforeunload = closeWs

    ws.onclose = (event) => console.debug('onclose', event)
    ws.onerror = (event) => console.error('onerror', event)
    ws.onmessage = (event) => console.log('onmessage', event)
    ws.onopen = (event) => console.debug('onopen', event)
    return ws
  } catch (e) {
    console.error(e)
  }
  return undefined
}

const useWebSocketUrl = (name: string, roomCode: string) => {
  const url = `wss://${window.location.host}/ws/?RoomCode=${roomCode}&Name=${name}`
  console.debug('WS URL:', url)
  return url
}

function useSendMessageFn(name: string, roomCode: string) {
  const url = useWebSocketUrl(name, roomCode)
  const ws = useWebSocket(url)
  return (message: Message) => {
    if (message && ws && ws?.readyState === WebSocket.OPEN) {
      try {
        ws.send(message)
        return true
      } catch (e) {
        console.error('Can not send message. Error: ', e)
      }
    }
    return false
  }
}

const LobbyContainer: React.FC<{ name: string; roomCode: string }> = ({
  name,
  roomCode,
}) => {
  const sendMessage = useSendMessageFn(name, roomCode)
  return <LobbyComponent sendMessage={sendMessage} />
}

export default LobbyContainer
