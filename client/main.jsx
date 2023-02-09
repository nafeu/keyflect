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
  const [hotkeyHistory, setHotkeyHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [app, setApp] = useState(null);

  const handleSocketConnect = () => {
    setIsConnected(true);
  }

  const handleKeyEvent = ({ activeKeyMapping, app, lastKey: { isDown, isModifier, displayName } }) => {
    setApp(app);
    setActiveKeyMapping(activeKeyMapping);
    if (isDown && !isModifier) {
      setLastKeyPressed(displayName)
    }
  }

  const handleCombinationEvent = ({ keys, desc }) => {
    setHotkeyHistory(currentHotkeyHistory => {
      const isRepeatHotkey = currentHotkeyHistory.length > 0
        && currentHotkeyHistory[0].keys === keys

      if (isRepeatHotkey) {
        const [firstHistoryItem, ...restOfHistory] = currentHotkeyHistory;

        return [
          {
            ...firstHistoryItem,
            count: firstHistoryItem.count + 1
          },
          ...restOfHistory
        ]
      }

      const updatedHistory = [{ keys, desc, count: 0 }, ...currentHotkeyHistory];

      if (updatedHistory.length > 3) {
        return [updatedHistory[0], updatedHistory[1], updatedHistory[2]];
      }

      return updatedHistory;
    })
  }

  const handleStatsTick = ({ inputsPerMinute, hotkeysPerMinute, eventCounterTicks }) => {
    setStats({ inputsPerMinute, hotkeysPerMinute });
  }

  const handleSocketDisconnect = () => {}

  useEffect(() => {
    socket.on('connect', handleSocketConnect);
    socket.on('disconnect', handleSocketDisconnect);

    socket.on('KEY_EVENT', handleKeyEvent);
    socket.on('COMBINATION_EVENT', handleCombinationEvent);
    socket.on('STATS_TICK', handleStatsTick);

    return () => {
      socket.off('connect');
      socket.off('disconnect');

      socket.off('KEY_EVENT');
      socket.off('COMBINATION_EVENT');
      socket.off('STATS_TICK');
    };
  }, []);

  const activeKeys = getActiveKeysByMapping(activeKeyMapping);

  if (isConnected) {
    return (
      <div className="app-container">
        <pre className="hotkey-history">
          {hotkeyHistory.map(({ keys, desc, count }) => (
            <div className="hotkey">
              {keys} : {desc} ({count})
            </div>
          ))}
        </pre>
        <pre className="stats">{JSON.stringify(stats, null, 2)}</pre>
        <div className="keycaps">
          <div className={`keycap ${activeKeyMapping['LEFT SHIFT'] && 'down'}`}>SHIFT</div>
          <div className={`keycap ${activeKeyMapping['LEFT CTRL'] && 'down'}`}>CTRL</div>
          <div className={`keycap ${activeKeyMapping['LEFT ALT'] && 'down'}`}>ALT</div>
          <div className={`keycap ${activeKeyMapping['LEFT META'] && 'down'}`}>CMD</div>
          <div className="keycap last-key-pressed">{lastKeyPressed || '-'}</div>
        </div>
        <div className="appname-bar">{app || '---'}</div>
      </div>
    );
  }

  return (
    <h4>Not connected to key server.</h4>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
