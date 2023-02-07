import React, { useState, useEffect, useRef, Fragment } from 'https://cdn.skypack.dev/react';
import ReactDOM from 'https://cdn.skypack.dev/react-dom';

import socket from './socket.jsx';

import './index.css';

const Keycap = ({ name }) => (
  <div className="keycap">{name}</div>
)

const getActiveKeysByMapping = mapping => Object.entries(mapping)
  .filter(entry => {
    const [key, value] = entry;

    return value;
  })
  .map(entry => {
    const [key, value] = entry;

    return { name: key };
  })

const App = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [activeKeyMapping, setActiveKeyMapping] = useState({});
  const [app, setApp] = useState(null);

  const handleSocketConnect = () => {
    setIsConnected(true);
  }

  const handleKeyEvent = ({ activeKeyMapping, app }) => {
    setApp(app);
    setActiveKeyMapping(activeKeyMapping);
  }

  const handleSocketDisconnect = () => {}

  useEffect(() => {
    socket.on('connect', handleSocketConnect);
    socket.on('disconnect', handleSocketDisconnect);

    socket.on('KEY_EVENT', handleKeyEvent);

    return () => {
      socket.off('connect');
      socket.off('disconnect');

      socket.off('KEY_EVENT');
    };
  }, []);

  const activeKeys = getActiveKeysByMapping(activeKeyMapping);

  if (isConnected) {
    return (
      <div>
        <div className="app">{app}</div>
        <div className="keycaps">
          {activeKeys.map(({ name }) => <Keycap name={name} />)}
        </div>
      </div>
    );
  }

  return (
    <h4>Not connected to key server.</h4>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
