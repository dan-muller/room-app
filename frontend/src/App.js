import "./App.css";
import React from "react";

const App = () => {
  const [body, setBody] = React.useState(["Events Show up here"]);
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
    try {
      const ws = new WebSocket(url);

      ws.onmessage = (event) => {
        console.debug("onmessage", event);
        setBody([...body, event]);
      };

      ws.onopen = (event) => {
        console.debug("onopen", event);
        setBody([...body, event]);
        try {
          const event = JSON.stringify({body: "Hello WS, I have connected."})
          console.log("sending", event)
          ws.send(event);
        } catch (e) {
          console.log("error on send")
          console.error(e)
        }
      };

      ws.onclose = (event) => {
        console.debug("onclose", event);
        setBody([...body, event]);
      };

      ws.onerror = (event) => {
        console.debug("onerror", event);
        setBody([...body, event]);
      };

      const closeWs = () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
      window.addEventListener("unload", closeWs);
      window.onbeforeunload = closeWs;
    } catch (e) {
      console.error(e)
    }
  } else {
    setBody([...body, "Uh oh! You need a Name and a RoomCode!"]);
  }

  return (
    <div className="App">
      <body>
        <ul>
          {body.map((text) => (
              <li>{text}</li>
          ))}
        </ul>
      </body>
    </div>
  );
};

export default App;
