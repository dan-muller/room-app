import React from 'react'
import * as faker from 'faker'

type ErrorEvent = { EventType: 'Error'; Message: string }
type MessageEvent = { EventType: 'Message'; Message: string; UserName: string }
type SystemEvent = { EventType: SystemEventType; Message: string }
type SystemEventType = 'System' | 'Connect' | 'Disconnect'
type UserEvent = { EventType: 'User'; Message: string }
export type LobbyEvent = ErrorEvent | MessageEvent | SystemEvent | UserEvent

export const errorEvent = (Message: string): ErrorEvent => ({
  EventType: 'Error',
  Message,
})

export const systemEvent = (Message: string): SystemEvent => ({
  EventType: 'System',
  Message,
})

export const userEvent = (Message: string): UserEvent => ({
  EventType: 'User',
  Message,
})

const useEvents = () => {
  const [events, setEvents] = React.useState<LobbyEvent[]>([
    {
      EventType: 'Error',
      Message: 'Error messages will show up here!',
    },
    {
      EventType: 'Message',
      Message: 'Messages will show up here!',
      UserName: faker.name.firstName(),
    },
    {
      EventType: 'System',
      Message: 'System messages will show up here!',
    },
    {
      EventType: 'User',
      Message: 'User messages will show up here!',
    },
  ])
  console.log({ events })
  const addEvent = React.useCallback<(event: LobbyEvent) => void>(
    (event) => {
      setEvents([...events, event])
    },
    [events, setEvents]
  )
  return { events, addEvent }
}

export default useEvents
