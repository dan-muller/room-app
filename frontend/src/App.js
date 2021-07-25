import "./App.css";
import React from "react";

import Lobby from "./Lobby";
import Welcome from "./Welcome";

const useParams = () => {
  const params = Object.fromEntries(
    window.location.search
      .replace("?", "")
      .split("&")
      .map((param) => param.split("="))
      .filter(([key, value]) => key)
  );
  console.debug("Params:", params);
  return params;
};

const App = () => {
  const { RoomCode, Name } = useParams();
  return (
    <div className="App">
      {(!RoomCode || !Name) && <Welcome />}
      {RoomCode && Name && <Lobby RoomCode={RoomCode} Name={Name} />}
    </div>
  );
};

export default App;
