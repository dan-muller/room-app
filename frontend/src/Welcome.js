import React, { useState } from "react";

import { Button } from "./Button";
import { Input } from "./Input";

const Welcome = () => {
  const [roomCode, setRoomCode] = useState();
  const [name, setName] = useState();
  return (
    <div className="App-body">
      <Input
        onChange={(e) => setRoomCode(e.target.value)}
        placeholder="Enter room code"
      />
      <Input
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
      />
      <Button
        onClick={() => {
          if (name && roomCode) {
            document.location.search = `?RoomCode=${roomCode}&Name=${name}`;
          }
        }}
      >
        Join
      </Button>
    </div>
  );
};

export default Welcome;
