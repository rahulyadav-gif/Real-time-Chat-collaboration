const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
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

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 