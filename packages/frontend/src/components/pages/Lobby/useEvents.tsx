import React from 'react'
import * as faker from 'faker'

type BaseEvent = { Message: string; Timestamp: string }
type ErrorEvent = BaseEvent & { EventType: 'Error' }
type MessageEvent = BaseEvent & { EventType: 'Message'; UserName: string }
type SystemEvent = BaseEvent & { EventType: SystemEventType }
type SystemEventType = 'System' | 'Connect' | 'Disconnect'
type UserEvent = BaseEvent & { EventType: 'User' }
export type LobbyEvent = ErrorEvent | MessageEvent | SystemEvent | UserEvent

export const errorEvent = (Message: string): ErrorEvent => ({
  EventType: 'Error',
  Message,
  Timestamp: new Date().toISOString(),
})

export const systemEvent = (Message: string): SystemEvent => ({
  EventType: 'System',
  Message,
  Timestamp: new Date().toISOString(),
})

export const userEvent = (Message: string): UserEvent => ({
  EventType: 'User',
  Message,
  Timestamp: new Date().toISOString(),
})

const useEvents = () => {
  const [events, setEvents] = React.useState<LobbyEvent[]>([
    {
      EventType: 'Error',
      Message: 'Error messages will show up here!',
      Timestamp: new Date().toISOString(),
    },
    {
      EventType: 'Message',
      Message: 'Messages will show up here!',
      Timestamp: new Date().toISOString(),
      UserName: faker.name.firstName(),
    },
    {
      EventType: 'System',
      Message: 'System messages will show up here!',
      Timestamp: new Date().toISOString(),
    },
    {
      EventType: 'User',
      Message: 'User messages will show up here!',
      Timestamp: new Date().toISOString(),
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
