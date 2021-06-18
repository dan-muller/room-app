import "./App.css";
import React from "react";

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
  return (
    <div className="App">
      <body>
        {body.map((text) => (
          <div>{text}</div>
        ))}
      </body>
    </div>
  );
};

export default App;
