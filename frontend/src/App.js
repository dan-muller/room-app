import "./App.css";
import React from "react";

const App = () => {
  const [body, setBody] = React.useState([]);
  console.debug("Body:", body);

  const params = Object.fromEntries(
    window.location.search
      .replace("?", "")
      .split("&")
      .map((param) => param.split("="))
  );

  const { RoomCode, Name } = params;

  if (RoomCode && Name) {
    const url = `wss://${window.location.host}/ws/?RoomCode=${RoomCode}&Name=${Name}`;
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
  } else {
    setBody([...body, "Uh oh! You need a Name and a RoomCode!"]);
  }

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
