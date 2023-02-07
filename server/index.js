const express = require('express');
const http = require('http');
const cors = require('cors');
const { GlobalKeyboardListener } = require('node-global-key-listener');
const activeWindow = require('active-win');

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

globalKeyboardListener.addListener(event => {
  const keyEvent = {
    name: event.name,
    state: event.state,
    app: activeWindow.sync().owner.name,
    timestamp: Date.now()
  }

  io.emit('KEY_EVENT', keyEvent);
});

server.listen(process.env.PORT || 8000, () => {
  console.log(`[ server.js ] Websocket server running on port ${server.address().port}`);
});
