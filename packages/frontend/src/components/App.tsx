import React from 'react'
import styled from 'styled-components'

const Lobby = React.lazy(() => import('components/Lobby'))
const Welcome = React.lazy(() => import('components/Welcome'))

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

const useParams = () => {
  const params = Object.fromEntries(
    window.location.search
      .replace('?', '')
      .split('&')
      .map((param) => param.split('='))
      .filter(([key, value]) => key)
  )
  console.debug('Params:', params)
  return params
}

const App = () => {
  const { RoomCode, Name } = useParams()
  return (
    <StyledApp>
      <React.Suspense fallback={<>Loading...</>}>
        {(!RoomCode || !Name) && <Welcome />}
        {RoomCode && Name && <Lobby roomCode={RoomCode} name={Name} />}
      </React.Suspense>
    </StyledApp>
  )
}

export default App
