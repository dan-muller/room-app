import styled from 'styled-components'
import React from 'react'
import { LobbyEvent } from './useEvents'

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
  display: flex;
  flex-flow: column nowrap;
  margin: 4px;

  :not(:last-child) {
    margin-bottom: 8px;
  }
`

type MessageProps = { message: string; timestamp: string }

const StyledErrorMessage = styled.div`
  align-self: center;
  font-weight: 500;
  color: red;
`
const ErrorMessage: React.FC<MessageProps> = ({ message }) => (
  <StyledChatRow>
    <StyledErrorMessage>{message}</StyledErrorMessage>
  </StyledChatRow>
)

const StyledSystemMessage = styled.div`
  align-self: center;
  font-style: italic;
  font-weight: 100;
`
const SystemMessage: React.FC<MessageProps> = ({ message }) => (
  <StyledChatRow>
    <StyledSystemMessage>{message}</StyledSystemMessage>
  </StyledChatRow>
)

const StyledMessage = styled.div`
  align-self: start;
  background: lightskyblue;
  border-radius: 9999px;
  padding: 8px;
`
const Message: React.FC<MessageProps & { userName: string }> = ({
  message,
  userName,
}) => (
  <StyledChatRow>
    <StyledMessage>
      {userName}: {message}
    </StyledMessage>
  </StyledChatRow>
)

const StyledUserMessage = styled.div`
  align-self: end;
  background: lightskyblue;
  border-radius: 9999px;
  padding: 8px;
`
const UserMessage: React.FC<MessageProps> = ({ message }) => (
  <StyledChatRow>
    <StyledUserMessage>You: {message}</StyledUserMessage>
  </StyledChatRow>
)

const Chat: React.FC<{ events: LobbyEvent[] }> = ({ events }) => (
  <StyledChatWrapper>
    {events.map((event) => {
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
