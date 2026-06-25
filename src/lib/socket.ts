import { io, Socket } from 'socket.io-client';

const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getSocket = (): Socket => {
    return io(socketUrl, {
        transports: ['polling', 'websocket'],
    });
};
