import React from 'react'

export const useWebSocket = (
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

export const useWebSocketUrl = (name: string, roomCode: string) => {
  const url = React.useMemo(
    () => `wss://${window.location.host}/ws/?RoomCode=${roomCode}&Name=${name}`,
    [roomCode, name]
  )
  console.debug('WS URL:', url)
  return url
}
