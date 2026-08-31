import { io, Socket } from 'socket.io-client';

export const socket: Socket = io({
  path: '/socket.io',
  reconnection: true,
  transports: ['polling', 'websocket'],
  autoConnect: true // Let Socket.IO handle connections and reconnections automatically
});
