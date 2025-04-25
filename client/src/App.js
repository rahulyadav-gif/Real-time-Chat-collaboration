import React, { useState, useEffect } from 'react';
import { Container, Paper, TextField, Button, Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import io from 'socket.io-client';

const SocketUri = process.env.SOCKET_IO_URI
const SocketPORT = process.env.SOCKET_IO_PORT

const socket = io(`${SocketUri}:${SocketPORT}`);

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((msgs) => [...msgs, message]);
    });

    socket.on('userList', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('message');
      socket.off('userList');
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('join', username);
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('message', message);
      setMessage('');
    }
  };

  if (!isJoined) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Join Chat
            </Typography>
            <form onSubmit={handleJoin}>
              <TextField
                fullWidth
                label="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
              >
                Join
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Paper elevation={3} sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Chat Room
            </Typography>
            <List sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
              {messages.map((msg, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={msg.text}
                      secondary={`${msg.user} - ${new Date(msg.timestamp).toLocaleTimeString()}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
              <TextField
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                variant="outlined"
                size="small"
              />
              <Button type="submit" variant="contained">
                Send
              </Button>
            </form>
          </Paper>
        </Box>
        <Paper elevation={3} sx={{ p: 2, width: 200 }}>
          <Typography variant="h6" gutterBottom>
            Online Users
          </Typography>
          <List>
            {users.map((user, index) => (
              <ListItem key={index}>
                <ListItemText primary={user} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
}

export default App; 