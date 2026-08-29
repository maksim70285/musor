import { io, Socket } from 'socket.io-client';

export const socket: Socket = io(window.location.origin, {
  path: '/socket.io',
  reconnection: true,
  transports: ['polling', 'websocket'],
  autoConnect: false // We connect manually when needed
});
