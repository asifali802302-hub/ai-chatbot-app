require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const { seedDemoData } = require('./config/seed');
const { setupChatSocket } = require('./socket/chatSocket');

// Route imports
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Global Rate Limiting (Day 6 / Day 10 requirement)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', apiLimiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AI Real-Time Chatbot API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('🚀 AI-Powered Real-Time Chatbot Backend is running live.');
});

// Setup WebSocket handlers
setupChatSocket(io);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDemoData();

  server.listen(PORT, () => {
    console.log(`
==================================================
🤖 AI Real-Time Chatbot Server Active!
📡 HTTP & REST API: http://localhost:${PORT}
⚡ WebSocket / Socket.io: ws://localhost:${PORT}
🩺 Health Check: http://localhost:${PORT}/health
==================================================
    `);
  });
};

startServer();
