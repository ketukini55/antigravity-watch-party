
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

interface UserState {
    userId: string;
    roomId: string;
    username: string;
}

// In-memory state management
const socketMap = new Map<string, UserState>();

export const initializeSocket = (httpServer: HttpServer) => {
    /*
   * CORS Configuration for Production
   * In production, set ALLOWED_ORIGIN in .env to your Vercel domain (e.g., https://watchparty.vercel.app)
   */
    const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

    const io = new Server(httpServer, {
        cors: {
            origin: allowedOrigin,
            methods: ['GET', 'POST'],
            credentials: true
        },
    });

    io.on('connection', (socket: Socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // --- Room Management ---

        socket.on('join-room', ({ roomId, userId, username }) => {
            console.log(`User ${username} (${userId}) joined room ${roomId}`);

            // Store state
            socketMap.set(socket.id, { userId, roomId, username });

            // Join socket room
            socket.join(roomId);

            // Broadcast to others in the room that a new user connected
            // We send the socketId so peers know who to call
            socket.to(roomId).emit('user-connected', {
                userId,
                username,
                socketId: socket.id
            });

            // Send list of existing users to the new user (optional, but helpful for mesh)
            const existingUsers = Array.from(socketMap.entries())
                .filter(([id, data]) => data.roomId === roomId && id !== socket.id)
                .map(([id, data]) => ({ socketId: id, ...data }));

            socket.emit('existing-users', existingUsers);
        });

        socket.on('leave-room', () => {
            handleDisconnect(socket, io);
        });

        // --- WebRTC Signaling ---

        // Relay Offer
        socket.on('offer', ({ offer, target }) => {
            io.to(target).emit('offer', {
                offer,
                sender: socket.id,
            });
        });

        // Relay Answer
        socket.on('answer', ({ answer, target }) => {
            io.to(target).emit('answer', {
                answer,
                sender: socket.id,
            });
        });

        // Relay ICE Candidate
        socket.on('ice-candidate', ({ candidate, target }) => {
            io.to(target).emit('ice-candidate', {
                candidate,
                sender: socket.id,
            });
        });

        // --- Real-Time Chat ---

        socket.on('send-message', ({ text, roomId, timestamp }) => {
            const user = socketMap.get(socket.id);
            if (user && user.roomId === roomId) {
                io.to(roomId).emit('receive-message', {
                    text,
                    senderId: user.userId,
                    username: user.username,
                    timestamp: timestamp || new Date().toISOString(),
                });
            }
        });

        // --- Disconnect Handling ---

        socket.on('disconnect', () => {
            handleDisconnect(socket, io);
        });
    });

    return io;
};

const handleDisconnect = (socket: Socket, io: Server) => {
    const user = socketMap.get(socket.id);
    if (user) {
        console.log(`User ${user.username} disconnected from room ${user.roomId}`);

        // Notify room
        io.to(user.roomId).emit('user-disconnected', {
            socketId: socket.id,
            userId: user.userId
        });

        // Cleanup state
        socketMap.delete(socket.id);
        socket.leave(user.roomId);
    }
};
