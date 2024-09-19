
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// // Express setup
// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// });

// const PORT = process.env.PORT || 3000;
// app.use(cors());
// app.use(express.json());

// // MongoDB setup
// mongoose.connect('mongodb://127.0.0.1:27017/user_profiles', {
//     useNewUrlParser: true, 
//     useUnifiedTopology: true
// });

// const userSchema = new mongoose.Schema({
//     name: String,
//     password: String,
//     profilePicture: String,  // URL or base64-encoded image
// });

// const User = mongoose.model('User', userSchema);

// // Serve HTML file
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/index.html');
// });

// // Signup API
// app.post('/signup', async (req, res) => {
//     const { name, password, profilePicture } = req.body;

//     if (!name || !password || !profilePicture) {
//         return res.status(400).json({ error: "All fields are required" });
//     }

//     const userExists = await User.findOne({ name });
//     if (userExists) {
//         return res.status(400).json({ error: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({
//         name,
//         password: hashedPassword,
//         profilePicture
//     });

//     try {
//         await newUser.save();
//         res.status(201).json({ message: "User created successfully" });
//     } catch (error) {
//         console.error('Error during sign-up:', error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // Signin API
// app.post('/signin', async (req, res) => {
//     const { name, password } = req.body;

//     if (!name || !password) {
//         return res.status(400).json({ error: "Name and password are required" });
//     }

//     const user = await User.findOne({ name });
//     if (!user) {
//         return res.status(400).json({ error: "Invalid credentials" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//         return res.status(400).json({ error: "Invalid credentials" });
//     }

//     // Send back the user profile excluding password
//     res.json({ name: user.name, profilePicture: user.profilePicture });
// });

// // Get other users except the logged-in user
// app.get('/users/:name', async (req, res) => {
//     try {
//         const users = await User.find({ name: { $ne: req.params.name } }, 'name profilePicture');
//         res.json(users);
//     } catch (error) {
//         console.error('Error fetching users:', error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // Socket.io setup for chat and call
// io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);

//     socket.on('join', (roomId) => {
//         console.log(`${socket.id} joined room ${roomId}`);
//         socket.join(roomId);
//     });

//     socket.on('chat-message', (roomId, message) => {
//         socket.to(roomId).emit('chat-message', message);
//     });

//     socket.on('disconnect', () => {
//         console.log('A user disconnected:', socket.id);
//     });
// });

// server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });












const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Express setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// MongoDB setup
mongoose.connect('mongodb://127.0.0.1:27017/user_profiles', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    name: String,
    password: String,
    profilePicture: String,  // URL or base64-encoded image
});

const User = mongoose.model('User', userSchema);

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Signup API
app.post('/signup', async (req, res) => {
    const { name, password, profilePicture } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: "Name and password are required" });
    }

    const userExists = await User.findOne({ name });
    if (userExists) {
        return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        name,
        password: hashedPassword,
        profilePicture
    });

    try {
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error('Error during sign-up:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Signin API
app.post('/signin', async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: "Name and password are required" });
    }

    const user = await User.findOne({ name });
    if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    // Send back the user profile excluding password
    res.json({ name: user.name, profilePicture: user.profilePicture });
});

// Get other users except the logged-in user
app.get('/users/:name', async (req, res) => {
    try {
        const users = await User.find({ name: { $ne: req.params.name } }, 'name profilePicture');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Socket.io setup for chat and call
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (roomId) => {
        console.log(`${socket.id} joined room ${roomId}`);
        socket.join(roomId);
    });

    socket.on('chat-message', (roomId, message) => {
        socket.to(roomId).emit('chat-message', message);
    });

    socket.on('offer', (roomId, offer) => {
        socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', (roomId, answer) => {
        socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', (roomId, candidate) => {
        socket.to(roomId).emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
