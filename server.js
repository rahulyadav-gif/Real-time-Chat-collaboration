const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const env = require("dotenv")

// initilize Env 
env.config()
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URI,
    methods: ["GET", "POST"]
  }
});

// Store connected users
const users = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle user joining
  socket.on('join', (username) => {
    users.set(socket.id, username);
    io.emit('userList', Array.from(users.values()));
    io.emit('message', {
      user: 'System',
      text: `${username} has joined the chat`,
      timestamp: new Date().toISOString()
    });
  });

  // Handle new messages
  socket.on('message', (message) => {
    const username = users.get(socket.id);
    io.emit('message', {
      user: username,
      text: message,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (username) {
      users.delete(socket.id);
      io.emit('userList', Array.from(users.values()));
      io.emit('message', {
        user: 'System',
        text: `${username} has left the chat`,
        timestamp: new Date().toISOString()
      });
    }
    console.log('Client disconnected');
  });
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server URL: http://localhost:${PORT}`);
});