require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const contactRoutes = require('./routes/contact.routes');
const conversationRoutes = require('./routes/conversation.routes');
const messageRoutes = require('./routes/message.routes');
const uploadRoutes = require('./routes/upload.routes');
const mlWebhookRoutes = require('./routes/mlWebhook.routes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketio(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Pass socket.io to the socket handler setup
socketHandler.init(io);

// Connect to Database
connectDB();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading local uploads from frontend
}));
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Attach Socket.io instance to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes Mapping
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ml', mlWebhookRoutes);

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Error Middleware]', err.message);
  
  // Handle Multer payload limit errors gracefully
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size too large. Maximum size is 100MB.' });
  }

  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Nexus Server running on port ${PORT}`);
});
