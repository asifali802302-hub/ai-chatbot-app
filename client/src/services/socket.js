import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  // Derive Socket server URL from VITE_API_URL or localhost:5000
  let serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  serverUrl = serverUrl.replace(/\/api\/?$/, ''); // Remove trailing /api

  socket = io(serverUrl, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('⚡ Socket connected to server with ID:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connection warning:', err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
