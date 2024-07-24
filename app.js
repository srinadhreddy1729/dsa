const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (roomId) => {
        console.log(`${socket.id} joined room ${roomId}`);
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', socket.id);
    });

    socket.on('offer', (roomId, offer) => {
        console.log(`Offer from ${socket.id} to room ${roomId}`);
        socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', (roomId, answer) => {
        console.log(`Answer from ${socket.id} to room ${roomId}`);
        socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', (roomId, candidate) => {
        console.log(`ICE candidate from ${socket.id} to room ${roomId}`);
        socket.to(roomId).emit('ice-candidate', candidate);
    });
    socket.on('chat-message', (roomId, message) => {
        console.log(`Message from ${socket.id} to room ${roomId}: ${message}`);
        socket.to(roomId).emit('chat-message', message);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
