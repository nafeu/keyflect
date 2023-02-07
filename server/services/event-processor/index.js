const handleKeyEvent = ({
  io,
  event: { name, state },
  app,
  timestamp,
  activeKeyMapping
}) => {
  const payload = {
    name,
    isDown: state === 'DOWN',
    app,
    timestamp,
    activeKeyMapping
  }

  io.emit('KEY_EVENT', payload);
}

module.exports = { handleKeyEvent };
