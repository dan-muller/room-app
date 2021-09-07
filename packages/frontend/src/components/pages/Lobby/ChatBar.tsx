import styled from 'styled-components'
import React from 'react'

import { Input } from 'components/atoms/Input'
import { Button } from 'components/atoms/Button'

const StyledChatBar = styled.div`
  display: inline-flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin-bottom: 16px;
`

const ChatBar: React.FC<{
  ready: boolean
  sendMessage: (message: string) => boolean
}> = ({ ready, sendMessage }) => {
  const [message, setMessage] = React.useState<string>('')
  const submit = React.useCallback(() => {
    const messageSent = sendMessage(message)
    if (messageSent) {
      console.debug('Message sent.')
      setMessage('')
    }
  }, [message, sendMessage, setMessage])
  return (
    <StyledChatBar
      onKeyDown={({ code }) => {
        if (code === 'Enter') {
          submit()
        }
      }}
    >
      <Input
        disabled={!ready}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
        style={{ flexGrow: 1 }}
        value={message}
      />
      <Button
        disabled={!ready || !message}
        onClick={() => submit()}
        style={{ marginLeft: '16px' }}
      >
        Send
      </Button>
    </StyledChatBar>
  )
}

export default ChatBar
