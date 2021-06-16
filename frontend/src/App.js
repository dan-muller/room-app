import "./App.css";
import React from "react";

function useBody() {
  const [body, setBody] = React.useState(["Hello World"]);
  console.debug("Body:", body);
  const url = window.location.href.replace("https", "ws") + "/ws/";
  console.debug("WS URL:", url);
  const ws = new WebSocket(url);
  ws.onmessage = (event) => {
    console.debug(event);
    setBody([...body, event]);
  };
  ws.send("Hello WS, I have connected.");
  return (
    <>
      {body.map((text) => (
        <div>{text}</div>
      ))}
    </>
  );
}

function App() {
  const body = useBody();
  return (
    <div className="App">
      <body>{body}</body>
    </div>
  );
}

export default App;
