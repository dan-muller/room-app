import "./App.css";
import React from "react";

import logo from "./logo.svg";
import "./App.css";

const Body = ({ ws }) => {
  const [body, setBody] = React.useState(["Events Show up here"]);
  const [error, setError] = React.useState();
  console.debug("Body:", body);

  try {
    ws.onmessage = (event) => {
      console.debug("onmessage", event);
      setBody([...body, JSON.stringify({ onmessage: event })]);
    };

    ws.onopen = (event) => {
      console.debug("onopen", event);
      setBody([...body, JSON.stringify({ onopen: event })]);
      try {
        const event = JSON.stringify({
          body: "Hello WS, I have connected.",
        });
        console.log("sending", event);
        ws.send(event);
      } catch (e) {
        console.log("error on send");
        console.error(e);
      }
    };

    ws.onclose = (event) => {
      console.debug("onclose", event);
      setBody([...body, JSON.stringify({ onclose: event })]);
    };

    ws.onerror = (event) => {
      console.debug("onerror", event);
      setBody([...body, JSON.stringify({ onerror: event })]);
    };

    const closeWs = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
    window.addEventListener("unload", closeWs);
    window.onbeforeunload = closeWs;
  } catch (e) {
    setError(e);
  }

  return (
    <div className="App-body">
      <div className="App-error">{error}</div>
      <img src={logo} className="App-logo" alt="logo" />
      <ul className="App-events">
        {body.map((text) => (
          <li>{text}</li>
        ))}
      </ul>
    </div>
  );
};

const useParams = () => {
  const params = Object.fromEntries(
    window.location.search
      .replace("?", "")
      .split("&")
      .map((param) => param.split("="))
  );
  console.debug("Params:", params);
  return params;
};

const useWebSocket = (RoomCode, Name) => {
  let ws = null;
  if (RoomCode && Name) {
    const url = `wss://${window.location.host}/ws/?RoomCode=${RoomCode}&Name=${Name}`;
    console.debug("WS URL:", url);
    try {
      ws = new WebSocket(url);
    } catch (e) {
      console.error(e);
    }
  }
  return ws;
};

const App = () => {
  const { RoomCode, Name } = useParams();
  const ws = useWebSocket(RoomCode, Name);
  return (
    <div className="App">
      {!ws && (
        <div className="App-body">
          <div className="App-error">
            Uh oh! You need a Name and a RoomCode!
          </div>
        </div>
      )}
      {ws && <Body ws={ws} />}
    </div>
  );
};

export default App;
