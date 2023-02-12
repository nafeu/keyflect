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
  const [stats, setStats] = useState(null);
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
    setStats({ inputsPerMinute, hotkeysPerMinute, eventCounterTicks });
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

  const inputsCountDataArray = stats?.eventCounterTicks?.map(({ inputsCount }) => inputsCount) || []
  const hotkeysCountDataArray = stats?.eventCounterTicks?.map(({ hotkeysCount }) => hotkeysCount) || []

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
        <div className="keycaps">
          <div className={`keycap ${activeKeyMapping['LEFT SHIFT'] && 'down'}`}>SHIFT</div>
          <div className={`keycap ${activeKeyMapping['LEFT CTRL'] && 'down'}`}>CTRL</div>
          <div className={`keycap ${activeKeyMapping['LEFT ALT'] && 'down'}`}>ALT</div>
          <div className={`keycap ${activeKeyMapping['LEFT META'] && 'down'}`}>CMD</div>
          <div className="keycap last-key-pressed">{lastKeyPressed || '-'}</div>
        </div>
        <div className="appname-bar">{app || '---'}</div>
        <div>
          <pre className="stats">HKPM {stats?.hotkeysPerMinute}</pre>
          <Chart
            data={hotkeysCountDataArray}
            width="100px"
            height="100px"
            lineColor="red"
            maxValue={10}
          />
          <pre className="stats">IPM {stats?.inputsPerMinute}</pre>
          <Chart
            data={inputsCountDataArray}
            width="100px"
            height="100px"
            lineColor="blue"
          />
        </div>
      </div>
    );
  }

  return (
    <h4>Not connected to key server.</h4>
  );
}

const mapValue = (value, inputMin, inputMax, outputMin, outputMax) => {
  return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin;
}

const Chart = ({
  data,
  lineMargin = 10,
  width,
  height,
  maxValue = 50,
  axisColor = 'black',
  lineColor = 'blue'
}) => {
  const intervalSize = data.length;

  const line = data.map((value, index) => {
    const pathCommand = index === 0 ? 'M' : 'L';

    const mappedValue = (100 - mapValue(value, 0, maxValue, 0, 80)) - lineMargin;

    return `${pathCommand} ${lineMargin + (index * ((100 - lineMargin) / intervalSize))} ${mappedValue}`
  }).join(' ');

  return (
    <div style={{ width, height }}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 0 0 v 100 h 100"
          stroke={axisColor}
          stroke-width="4"
          fill="transparent"
          stroke-linejoin="round"
        />
        <path
          d={line}
          stroke={lineColor}
          stroke-width="2"
          fill="transparent"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  );
}


ReactDOM.render(<App />, document.getElementById("root"));
