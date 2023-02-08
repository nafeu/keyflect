const getKeyCombination = ({ activeKeyMapping, app: currentApp, name, isDown, config, timestamp }) => {
  if (!isDown) return;

  const matchedAppHotkeys = config.find(({ app }) => app === currentApp)

  if (!matchedAppHotkeys) return;

  const activeKeys = Object.keys(activeKeyMapping).filter(key => activeKeyMapping[key]);
  const matchedKeyCombination = matchedAppHotkeys.hotkeys.find(
    ({ keys }) => keys.sort().join() === activeKeys.sort().join()
  );

  if (!matchedKeyCombination) return;

  return { ...matchedKeyCombination, timestamp };
}

const processKeyEvent = ({
  io,
  event: { name, state },
  app,
  timestamp,
  activeKeyMapping,
  config
}) => {
  const isDown = state === 'DOWN';

  const payload = {
    lastKey: {
      name,
      isDown
    },
    app,
    timestamp,
    activeKeyMapping
  }

  io.emit('KEY_EVENT', payload);

  const keyCombination = getKeyCombination({
    activeKeyMapping,
    app,
    config,
    isDown,
    name,
    timestamp
  });

  if (keyCombination) {
    io.emit('COMBINATION_EVENT', keyCombination)
  }
}

module.exports = { processKeyEvent };
