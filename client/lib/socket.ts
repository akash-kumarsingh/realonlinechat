import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
    socket = io(SERVER_URL, {
      // WebSocket first — skip polling entirely for lowest latency
      transports: ['websocket'],
      // Reconnect settings
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
      // Keep socket alive aggressively
      pingTimeout: 20000,
      pingInterval: 10000,
      // Don't auto-connect — pages connect explicitly
      autoConnect: false,
      // Upgrade immediately
      upgrade: false,
      // Timeout for initial connection
      timeout: 5000,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
