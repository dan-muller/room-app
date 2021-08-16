import React from 'react'
import styled from 'styled-components'

import {
  Provider as AppContextProvider,
  useRoomCode,
  useUserName,
} from 'components/Context'

const Lobby = React.lazy(() => import('components/pages/Lobby'))
const Welcome = React.lazy(() => import('components/pages/Welcome'))

const StyledApp = styled.div`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-size: calc(10px + 2vmin);
  color: white;
`

const AppComponent = () => {
  const roomCode = useRoomCode()
  const userName = useUserName()
  return (
    <React.Suspense fallback={<>Loading...</>}>
      {roomCode && userName ? (
        <Lobby roomCode={roomCode} userName={userName} />
      ) : (
        <Welcome roomCode={roomCode} userName={userName} />
      )}
    </React.Suspense>
  )
}

const AppContainer = () => (
  <StyledApp>
    <AppContextProvider>
      <AppComponent />
    </AppContextProvider>
  </StyledApp>
)

export default AppContainer
