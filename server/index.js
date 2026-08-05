const { initPrivateRooms } = require('./privateRooms');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const apiRoutes = require('./routes/api');
const { initSocket, initGroupRooms } = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ─── Socket.IO ────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, /\.vercel\.app$/],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 10000,
  pingInterval: 8000,
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  maxHttpBufferSize: 1e5,
  perMessageDeflate: false,
});

// ─── Middleware ───────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: [CLIENT_URL, /\.vercel\.app$/],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.set('trust proxy', 1);

// ─── Routes ───────────────────────────────────────────────────
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'Real Online Chat API',
    version: '1.0.0',
    status: 'running',
    docs: '/api/health',
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

const start = async () => {
  await connectDB();
  initSocket(io);
  initPrivateRooms(io);
  initGroupRooms(io);

  server.listen(PORT, () => {
    console.log(`🚀 Real Online Chat server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Client URL: ${CLIENT_URL}`);
  });

  // ─── Telegram Mini App Setup ──────────────────────────────
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (TELEGRAM_TOKEN) {
    const https = require('https');
    const SITE_URL = process.env.CLIENT_URL || 'https://realonlinechat.vercel.app';

    const data = JSON.stringify({
      type: 'web_app',
      text: '💬 Open Chat',
      web_app: { url: SITE_URL }
    });

    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_TOKEN}/setChatMenuButton`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => console.log('🤖 Telegram menu button set:', body));
    });

    req.on('error', e => console.error('❌ Telegram error:', e.message));
    req.write(data);
    req.end();
  } else {
    console.log('⚠️  TELEGRAM_BOT_TOKEN not set. Telegram features disabled.');
  }
};

start();
