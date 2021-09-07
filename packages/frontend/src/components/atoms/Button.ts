import styled from 'styled-components'

export const Button = styled.button`
  padding: 10px 20px;
  margin: 5px 0px;
  font-size: large;
  display: block;
  border: 1px solid lightgrey;
  border-radius: 99999px;

  :hover {
    background: lightgrey;
    cursor: pointer;
  }

  :disabled {
    background: lightgrey;
    cursor: initial;
  }
`
