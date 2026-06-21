const express = require('express');
const http = require('http');
const next = require('next');
const { Server } = require('socket.io');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);
  
  // Initialize Socket.IO with CORS settings
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Attach io to global and express app context
  global.io = io;
  expressApp.set('io', io);

  // Socket.IO Connection Handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room based on User ID for targeted notifications
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined their notification room.`);
      }
    });

    // Join room based on Role (e.g., PLACEMENT_OFFICER, RECRUITER)
    socket.on('join_role_room', (role) => {
      if (role) {
        socket.join(role);
        console.log(`Socket ${socket.id} joined role room: ${role}`);
      }
    });

    // Real-time chat messaging channels
    socket.on('send_chat_message', (data) => {
      const { receiverId, content, senderId, senderName } = data;
      // Emit to specific receiver room
      io.to(receiverId).emit('receive_chat_message', {
        senderId,
        senderName,
        content,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  // Catch-all route handler for Next.js app pages and API routing
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Server ready on http://localhost:${port} - Mode: ${dev ? 'development' : 'production'}`);
  });
});
