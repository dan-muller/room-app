import "./App.css";
import React from "react";

function App() {
  const [body, setBody] = React.useState(["Hello World"]);
  const url = window.location.href.replace("https", "ws") + "/ws/";
  const ws = new WebSocket(url);
  ws.onmessage = (ev) => {
    setBody([...body, ev]);
  };
  return (
    <div className="App">
      <body>
        {body.map((text) => (
          <div>{text}</div>
        ))}
      </body>
    </div>
  );
}

export default App;
