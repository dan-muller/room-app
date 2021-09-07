import styled from 'styled-components'
import React from 'react'

import { LobbyEvent } from './useEvents'

const StyledTimestamp = styled.div`
  font-size: 12px;
  font-weight: 100;
  height: 12px;
`

const StyledChatRow = styled.div<{ align?: 'left' | 'right' | 'center' }>`
  display: flex;
  flex-flow: column;
  margin: 4px;
  align-items: ${({ align }) => {
    switch (align) {
      case 'right':
        return 'end'
      case 'center':
        return 'center'
      default:
        return 'start'
    }
  }};
`

const ChatRow: React.FC<
  React.ComponentProps<typeof StyledChatRow> & {
    timestamp: string
  }
> = ({ align, children, timestamp }) => {
  const [showMore, setShowMore] = React.useState(false)
  return (
    <StyledChatRow
      align={align}
      onMouseEnter={() => setShowMore(true)}
      onMouseLeave={() => setShowMore(false)}
    >
      {children}
      <StyledTimestamp>
        {showMore && new Date(timestamp).toLocaleTimeString()}
      </StyledTimestamp>
    </StyledChatRow>
  )
}

type MessageProps = { message: string; timestamp: string }

const StyledErrorMessage = styled.div`
  align-self: center;
  font-weight: 500;
  color: red;
`
const ErrorMessage: React.FC<MessageProps> = ({ message, timestamp }) => (
  <ChatRow timestamp={timestamp} align="center">
    <StyledErrorMessage>{message}</StyledErrorMessage>
  </ChatRow>
)

const StyledSystemMessage = styled.div`
  align-self: center;
  font-style: italic;
  font-weight: 100;
`
const SystemMessage: React.FC<MessageProps> = ({ message, timestamp }) => (
  <ChatRow timestamp={timestamp} align="center">
    <StyledSystemMessage>{message}</StyledSystemMessage>
  </ChatRow>
)

const StyledMessage = styled.div`
  background: lightgrey;
  border-radius: 9999px;
  padding: 8px;
`
const Message: React.FC<MessageProps & { userName: string }> = ({
  message,
  userName,
  timestamp,
}) => {
  return (
    <ChatRow timestamp={timestamp}>
      <StyledMessage>
        {userName}: {message}
      </StyledMessage>
    </ChatRow>
  )
}

const StyledUserMessage = styled.div`
  background: lightskyblue;
  border-radius: 9999px;
  padding: 8px;
`
const UserMessage: React.FC<MessageProps> = ({ message, timestamp }) => {
  return (
    <ChatRow timestamp={timestamp} align="right">
      <StyledUserMessage>You: {message}</StyledUserMessage>
    </ChatRow>
  )
}

const StyledChatWrapper = styled.div`
  align-content: center;
  background: white;
  border-radius: 24px;
  color: black;
  flex-grow: 1;
  font-size: 16px;
  justify-content: start;
  overflow: hidden auto;
  padding: 16px;
`

const Chat: React.FC<{ events: LobbyEvent[] }> = ({ events }) => (
  <StyledChatWrapper>
    {events.map((event) => {
      console.log(event)
      switch (event.EventType) {
        case 'Error':
          return (
            <ErrorMessage message={event.Message} timestamp={event.Timestamp} />
          )
        case 'System':
          return (
            <SystemMessage
              message={event.Message}
              timestamp={event.Timestamp}
            />
          )
        case 'Connect':
          return (
            <SystemMessage
              message={event.Message}
              timestamp={event.Timestamp}
            />
          )
        case 'Disconnect':
          return (
            <SystemMessage
              message={event.Message}
              timestamp={event.Timestamp}
            />
          )
        case 'User':
          return (
            <UserMessage message={event.Message} timestamp={event.Timestamp} />
          )
        default:
          return (
            <Message
              message={event.Message}
              timestamp={event.Timestamp}
              userName={event.UserName}
            />
          )
      }
    })}
  </StyledChatWrapper>
)

export default Chat
