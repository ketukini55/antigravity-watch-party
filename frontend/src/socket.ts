import { io } from 'socket.io-client';

// This checks if we are on Vercel or on your laptop
const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.keee7.in';

export const socket = io(URL, {
    transports: ['websocket'], // Faster for video parties
    reconnection: true
});