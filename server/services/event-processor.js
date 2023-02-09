const { acceptedNameToMacKeycodeMapping, modifierKeyIds } = require('../utils/keycode-lookup');

const isEqualCombination = ({ inputKeys, activeKeys }) => {
  const serializedInputKeys = inputKeys
    .split('+')
    .map(acceptedName => acceptedNameToMacKeycodeMapping[acceptedName.toLowerCase()])
    .sort()
    .join('+')

  const serializedActiveKeys = activeKeys
    .map(acceptedName => acceptedNameToMacKeycodeMapping[acceptedName.toLowerCase()])
    .sort()
    .join('+')

  return serializedInputKeys === serializedActiveKeys;
}

const getKeyCombination = ({ activeKeyMapping, app: currentApp, name, isDown, config, timestamp }) => {
  if (!isDown) return;

  const matchedAppHotkeys = config.find(({ app }) => app === currentApp)

  if (!matchedAppHotkeys) return;

  const activeKeys = Object.keys(activeKeyMapping).filter(key => activeKeyMapping[key]);

  const moreThanOneKeyPressed = activeKeys.length > 1;

  if (!moreThanOneKeyPressed) return;

  const matchedKeyCombination = matchedAppHotkeys.hotkeys.find(
    ({ keys }) => isEqualCombination({ inputKeys: keys, activeKeys })
  );

  if (!matchedKeyCombination) return;

  return { ...matchedKeyCombination, timestamp };
}

const processKeyEvent = ({
  io,
  event: {
    displayName,
    name,
    state
  },
  app,
  timestamp,
  activeKeyMapping,
  config,
  eventCounterTicks
}) => {
  const isDown = state === 'DOWN';

  const payload = {
    lastKey: {
      name,
      isDown,
      isModifier: modifierKeyIds.includes(name),
      displayName
    },
    app,
    timestamp,
    activeKeyMapping,
  }

  eventCounterTicks[0].actionsCount += 1;
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
    eventCounterTicks[0].hotkeysCount += 1;
    io.emit('COMBINATION_EVENT', keyCombination)
  }
}

module.exports = { processKeyEvent };
