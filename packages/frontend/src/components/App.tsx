import React from 'react'
import styled from 'styled-components'

import { Provider as ContextProvider } from 'components/Context'

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

const useParams = (): Record<string, string | undefined> => {
  const params = Object.fromEntries(
    window.location.search
      .replace('?', '')
      .split('&')
      .map((param) => param.split('='))
      .filter(([key]) => key)
  )
  console.debug('Params:', params)
  return params
}

const App = () => {
  const { RoomCode, Name } = useParams()

  return (
    <StyledApp>
      <ContextProvider>
        <React.Suspense fallback={<>Loading...</>}>
          {(!RoomCode || !Name) && <Welcome />}
          {RoomCode && Name && <Lobby roomCode={RoomCode} name={Name} />}
        </React.Suspense>
      </ContextProvider>
    </StyledApp>
  )
}

export default App
