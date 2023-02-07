import React, { useState, useEffect, useRef, Fragment } from 'https://cdn.skypack.dev/react';
import ReactDOM from 'https://cdn.skypack.dev/react-dom';

import socket from './socket.jsx';

import './index.css';

const getActiveKeysByMapping = mapping => Object.entries(mapping)
  .filter(entry => {
    const [key, value] = entry;

    return value;
  })
  .map(entry => {
    const [key, value] = entry;

    return key;
  })

const App = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [activeKeyMapping, setActiveKeyMapping] = useState({});
  const [lastKeyPressed, setLastKeyPressed] = useState(null);
  const [app, setApp] = useState(null);

  const handleSocketConnect = () => {
    setIsConnected(true);
  }

  const handleKeyEvent = ({ activeKeyMapping, app, lastKey }) => {
    setApp(app);
    setActiveKeyMapping(activeKeyMapping);
    if (lastKey.isDown) {
      setLastKeyPressed(lastKey.name)
    }
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
      <div className="app-container">
        <div className="hotkey-history"></div>
        <div className="keycaps">
          <div className={`keycap ${activeKeyMapping['LEFT SHIFT'] && 'down'}`}>SHIFT</div>
          <div className={`keycap ${activeKeyMapping['LEFT CTRL'] && 'down'}`}>CTRL</div>
          <div className={`keycap ${activeKeyMapping['LEFT ALT'] && 'down'}`}>ALT</div>
          <div className={`keycap ${activeKeyMapping['LEFT META'] && 'down'}`}>CMD</div>
          <div className="keycap last-key-pressed">{lastKeyPressed || '-'}</div>
        </div>
        <div className="app-container">{app || '---'} | github.com/nafeu/dotfiles</div>
      </div>
    );
  }

  return (
    <h4>Not connected to key server.</h4>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
