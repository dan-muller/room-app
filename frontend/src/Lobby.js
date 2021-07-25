import React from "react";

import { Button } from "./Button";
import { Input } from "./Input";

const LobbyComponent = ({ sendMessage }) => {
  const [message, setMessage] = React.useState("Hello WS, I have connected.");
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
          const success = sendMessage(message);
          if (success) {
            console.debug("Message sent.");
            setMessage(undefined);
          }
        }}
      >
        Send
      </Button>
    </div>
  );
};

const useWebSocket = (url) => {
  let ws = null;
  try {
    ws = new WebSocket(url);

    const closeWs = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
    window.addEventListener("unload", closeWs);
    window.onbeforeunload = closeWs;

    ws.onclose = (event) => console.debug("onclose", event);
    ws.onerror = (event) => console.error("onerror", event);
    ws.onmessage = (event) => console.log("onmessage", event);
    ws.onopen = (event) => console.debug("onopen", event);
  } catch (e) {
    console.error(e);
  }
  return ws;
};

const LobbyContainer = ({ Name, RoomCode }) => {
  const url = `wss://${window.location.host}/ws/?RoomCode=${RoomCode}&Name=${Name}`;
  console.debug("WS URL:", url);
  const ws = useWebSocket(url);

  const sendMessage = (message) => {
    if (message && ws && ws?.readyState === WebSocket.OPEN) {
      try {
        ws.send(message);
        return true;
      } catch (e) {
        console.error("Can not send message. Error: ", e);
      }
      return false;
    }
  };

  return <LobbyComponent sendMessage={sendMessage} />;
};

export default LobbyContainer;
