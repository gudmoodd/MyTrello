import { io } from 'socket.io-client';


const SOCKET_URL = 'http://localhost:5000';
export const socket = io(SOCKET_URL, {
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
  window.socket = socket; 
});
socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

export function inviteMemberSocket(inviteData) {
  socket.emit('invite-member', inviteData);
}
