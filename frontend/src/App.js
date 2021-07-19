import "./App.css";
import React from "react";

import logo from "./logo.svg";
import "./App.css";

const useEvents = () => {
  const [events, setEvents] = React.useState([
    { Event: "Events Show up here" },
    { EventType: "error", Event: "This is what an error looks like" },
  ]);
  const addEvent = (type, event) => {
    console.debug(type, event);
    setEvents([...events, { EventType: type, Event: event }]);
  };
  return { events, addEvent };
};

const Body = ({ ws }) => {
  const { events, addEvent } = useEvents();
  console.debug("Events:", events);

  try {
    ws.onmessage = (event) => {
      addEvent("onmessage", event);
    };

    ws.onopen = (event) => {
      addEvent("onopen", event);
      try {
        const event = JSON.stringify({
          body: "Hello WS, I have connected.",
        });
        console.log("sending", event);
        ws.send(event);
      } catch (e) {
        console.error("error on send");
        addEvent("error", e);
      }
    };

    ws.onclose = (event) => {
      console.debug("onclose", event);
    };

    ws.onerror = (event) => {
      console.error("onerror", event);
    };

    const closeWs = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
    window.addEventListener("unload", closeWs);
    window.onbeforeunload = closeWs;
  } catch (e) {
    addEvent("error", e);
  }

  return (
    <div className="App-body">
      <img src={logo} className="App-logo" alt="logo" />
      <ul className="App-events">
        {events
          .filter(({ Event }) => Event)
          .map(({ EventType, Event }) => (
            <li className={EventType === "error" ? "App-error" : "App-events"}>
              {JSON.stringify(Event)}
            </li>
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
