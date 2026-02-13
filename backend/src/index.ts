import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeSocket } from './socket';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io via the separate module
const io = initializeSocket(server);

const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Watch Party Backend is Running! 🚀');
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
