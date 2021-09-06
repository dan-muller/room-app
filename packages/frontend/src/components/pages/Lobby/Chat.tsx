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
    aaa
    {console.log(events)}
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

export default Chat
