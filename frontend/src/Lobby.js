import React from "react";

import { Button } from "./Button";
import { Input } from "./Input";

const WebSocketState = {
  [WebSocket.CLOSED]: "CLOSED",
  [WebSocket.CLOSING]: "CLOSING",
  [WebSocket.CONNECTING]: "CONNECTING",
  [WebSocket.OPEN]: "OPEN",
};

const LobbyComponent = ({ ws, events, addEvent }) => {
  const [message, setMessage] = React.useState("Hello WS, I have connected.");

  ws.onmessage = (event) => addEvent("onmessage", JSON.parse(event.data));

  const sendMessage = () => {
    if (ws.readyState !== WebSocket.OPEN) {
      addEvent("error", `WebSocket state is ${WebSocketState[ws.readyState]}`);
      return;
    }
    if (message) {
      try {
        console.log("Message: ", message);
        ws.send(message);
        setMessage(null);
      } catch (e) {
        console.error("Failed to send message:", message);
        addEvent("error", e);
      }
      return;
    }
    addEvent("error", `Please enter a message.`);
  };

  return (
    <div className="App-body">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
      <Button
        disabled={!message}
        onClick={() => {
          sendMessage();
        }}
      >
        Send
      </Button>
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

const useWebSocket = (RoomCode, Name) => {
  let ws = null;
  if (RoomCode && Name) {
    const url = `wss://${window.location.host}/ws/?RoomCode=${RoomCode}&Name=${Name}`;
    console.debug("WS URL:", url);
    try {
      ws = new WebSocket(url);

      const closeWs = () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
      window.addEventListener("unload", closeWs);
      window.onbeforeunload = closeWs;

      ws.onopen = (event) => console.debug("onopen", event);
      ws.onclose = (event) => console.debug("onclose", event);
      ws.onerror = (event) => console.error("onerror", event);
    } catch (e) {
      console.error(e);
    }
  }
  return ws;
};

const useEvents = () => {
  const [events, setEvents] = React.useState([
    { Event: "Events Show up here" },
    { EventType: "error", Event: "This is what an error looks like" },
  ]);
  const addEvent = (type, event) => {
    console.debug(type, event);
    setEvents([...events, { EventType: type, Event: event }]);
  };
  console.debug("Events:", events);
  return { events, addEvent };
};

const LobbyContainer = ({ Name, RoomCode }) => {
  const { events, addEvent } = useEvents();
  const ws = useWebSocket(RoomCode, Name);
  return <LobbyComponent ws={ws} events={events} addEvent={addEvent} />;
};

export default LobbyContainer;
