import React from 'react'

import useTimeout from 'components/hooks/useTimeout'

export const useWebSocket = (
  url: string,
  handlers: {
    onClose: (event: CloseEvent) => void
    onError: (event: Event | string) => void
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

  useTimeout(() => {
    if (ws && ws.readyState !== WebSocket.OPEN) {
      onError('Unable to connect.')
    }
  }, 5000)

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
