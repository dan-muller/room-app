import "./App.css";
import React from "react";
import logo from "./logo.svg";

const useParams = () =>
  Object.fromEntries(
    window.location.search
      .replace("?", "")
      .split("&")
      .map((param) => param.split("="))
  );

const App = () => {
  const [body, setBody] = React.useState(["Events Show up here"]);
  const [error, setError] = React.useState();
  console.debug("Body:", body);
  const params = useParams();
  console.debug("Params:", params);
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
      console.error(e);
    }
  } else {
    setError("Uh oh! You need a Name and a RoomCode!");
  }

  return (
    <div className="App">
      <div className="App-header">
        {error}
        <img src={logo} className="App-logo" alt="logo" />
        <ul>
          {body.map((text) => (
            <li>{text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
