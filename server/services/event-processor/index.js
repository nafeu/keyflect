const processKeyEvent = ({
  io,
  event: { name, state },
  app,
  timestamp,
  activeKeyMapping
}) => {
  const payload = {
    lastKey: {
      name,
      isDown: state === 'DOWN'
    },
    app,
    timestamp,
    activeKeyMapping
  }

  io.emit('KEY_EVENT', payload);
}

module.exports = { processKeyEvent };
