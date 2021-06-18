import "./App.css";
import React from "react";
import styled from "styled-components/macro";

const Input = styled.input`
  width: 250px;
  display: flex;
  border: 1px dimgray;
`;

const Button = styled.button`
  width: 250px;
  display: flex;
  border: 1px dimgray;
`;

const App = () => {
  const [body, setBody] = React.useState([]);
  console.debug("Body:", body);
  const url = `wss://${window.location.host}/ws/`;
  console.debug("WS URL:", url);
  const ws = new WebSocket(url);
  ws.onmessage = (event) => {
    console.debug("onmessage", event);
    setBody([...body, event]);
  };
  ws.onopen = (event) => {
    console.debug("onopen", event);
    ws.send("Hello WS, I have connected.");
  };
  ws.onclose = (event) => {
    console.debug("onclose", event);
  };
  ws.onerror = (event) => {
    console.debug("onerror", event);
  };
  const [input, setInput] = React.useState("Hello World");
  console.log("input", input);
  return (
    <div className="App">
      <body>
        <div>
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button onClick={() => ws.send(input)}>Send</Button>
        </div>
        {body.map((text) => (
          <div>{text}</div>
        ))}
      </body>
    </div>
  );
};

export default App;
