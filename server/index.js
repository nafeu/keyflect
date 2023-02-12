const express = require('express');
const http = require('http');
const cors = require('cors');
const yaml = require('js-yaml');
const fs = require('fs');
const { GlobalKeyboardListener } = require('node-global-key-listener');
const activeWindow = require('active-win');
const { processKeyEvent } = require('./services/event-processor');
const { macKeycodeToDisplayNameMapping } = require('./utils/keycode-lookup');

let config;

try {
  config = yaml.load(fs.readFileSync('config.yml', 'utf8'));
} catch (error) {
  console.log(`[ error ] missing config.yml, run 'cp sample-config.yml config.yml'`);
  process.exit(1);
}

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

const ONE_SECOND_MS = 1000;
const TICK_RATE_MS = ONE_SECOND_MS;
const TICK_INTERVAL_SIZE_S = 10;
const FIRST_THREE_ITEMS = 3;

const defaultTickData = { inputsCount: 0, hotkeysCount: 0 };
let eventCounterTicks = [...Array(TICK_INTERVAL_SIZE_S).fill({ ...defaultTickData })];

setInterval(() => {
  const { inputsSum, hotkeysSum } = eventCounterTicks.slice(0, FIRST_THREE_ITEMS)
    .reduce((sum, { inputsCount, hotkeysCount }) => {
      sum['inputsSum'] += inputsCount;
      sum['hotkeysSum'] += hotkeysCount;
      return sum;
    }, { inputsSum: 0, hotkeysSum: 0 });

  const inputsPerMinute = Math.round((inputsSum / FIRST_THREE_ITEMS) * 20);
  const hotkeysPerMinute = Math.round((hotkeysSum / FIRST_THREE_ITEMS) * 20);

  io.emit('STATS_TICK', { eventCounterTicks, inputsPerMinute, hotkeysPerMinute })

  eventCounterTicks = [{ ...defaultTickData }, ...eventCounterTicks.slice(0, -1)];
}, TICK_RATE_MS)

const handleKeyEvent = (event, activeKeyMapping) => {
  const app = activeWindow.sync().owner.name;

  const isAppNotSupported = config.find(supportedApp => supportedApp === app) === null;

  if (isAppNotSupported) return;

  processKeyEvent({
    io,
    event: {
      name: event.rawKey._nameRaw,
      displayName: macKeycodeToDisplayNameMapping[event.rawKey._nameRaw] || event.name,
      state: event.state
    },
    app,
    timestamp: Date.now(),
    activeKeyMapping,
    config,
    eventCounterTicks
  })
};

globalKeyboardListener.addListener(handleKeyEvent);

server.listen(process.env.PORT || 8000, () => {
  console.log(`[ server.js ] Websocket server running on port ${server.address().port}`);
});
