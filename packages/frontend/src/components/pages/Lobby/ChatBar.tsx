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

export default ChatBar
