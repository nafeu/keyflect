import React, { useState, useEffect, useRef, Fragment } from 'https://cdn.skypack.dev/react';
import ReactDOM from 'https://cdn.skypack.dev/react-dom';

import socket from './socket.jsx';

const App = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [key, setKey] = useState('');

  const handleSocketConnect = () => {
    setIsConnected(true);
  }

  const handleKeyEvent = keyEventInfo => {
    setKey(keyEventInfo);
  }

  const handleSocketDisconnect = () => {}

  useEffect(() => {
    socket.on('connect', handleSocketConnect);
    socket.on('disconnect', handleSocketDisconnect);
    socket.on('key-event', handleKeyEvent);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('key-event');
    };
  }, []);

  if (isConnected) {
    return (
      <h1>{key}</h1>
    );
  }

  return (
    <h4>Not connected to key server.</h4>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
