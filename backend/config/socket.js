const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable must be set');
}
let io = null;

function initSocket(server) {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.joinedUser = null;

    const authenticateSocket = (token) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET, {
          algorithms: ['HS256'],
        });

        const userId = decoded.userId || decoded.id;
        if (!userId) {
          throw new Error('Missing user id in token');
        }

        socket.join(`user:${userId}`);
        socket.joinedUser = userId;
        socket.emit('authenticated', { success: true });
      } catch (err) {
        socket.emit('unauthorized', { message: 'Invalid or expired token' });
        socket.disconnect(true);
      }
    };

    // Support both auth handshake token and explicit authenticate events.
    const handshakeToken = socket.handshake?.auth?.token || socket.handshake?.query?.token;
    if (handshakeToken) {
      authenticateSocket(handshakeToken);
    }

    socket.on('authenticate', (token) => {
      authenticateSocket(token);
    });

    socket.on('disconnect', () => {
      // socket.io cleans up room membership automatically on disconnect
    });
  });

  return io;
}

function getSocket() {
  if (!io) {
    throw new Error('Socket server has not been initialized yet.');
  }
  return io;
}

module.exports = {
  initSocket,
  getSocket,
};
