const express = require('express');
const http = require('http');
const cors = require('cors');
const { GlobalKeyboardListener } = require('node-global-key-listener');
const activeWindow = require('active-win');
const { processKeyEvent } = require('./services/event-processor');

const app = express();
const server = http.Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

const globalKeyboardListener = new GlobalKeyboardListener();

app.use(cors());

app.get('/api', (req, res) => {
  res.json({ message: 'success' })
});

io.on('connection', (socket) => {
  console.log(`[ server.js ] ${socket.id} connected`);

  socket.on('disconnect', () => {
    console.log(`[ server.js ] ${socket.id} disconnected`);
  });
});

const handleKeyEvent = (event, activeKeyMapping) => processKeyEvent({
  io,
  event: {
    name: event.name,
    state: event.state
  },
  app: activeWindow.sync().owner.name,
  timestamp: Date.now(),
  activeKeyMapping
});

globalKeyboardListener.addListener(handleKeyEvent);

server.listen(process.env.PORT || 8000, () => {
  console.log(`[ server.js ] Websocket server running on port ${server.address().port}`);
});
