const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const { formatMessage, saveMessageToDB } = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const mongoose = require('mongoose');

global.jwt;
jwt = require('jsonwebtoken');

global.accessTokenSecret = '#believeInTokens//nHUIyg7g7gG7g';

// INITILIAZE APP
const app = express();

// ALLOW CORS CONNECTION
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
 
// parse application/json
app.use(express.json());

const server = http.createServer(app);
const io = socketio(server);

// ################################################
// ############# CONNECT TO MONGODB ###############
// ################################################
const db = require(path.join(__dirname, 'config', 'keys.js')).MongoURI;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// ################################################
// ############# ROUTING - START ##################
// ################################################

// APPEND INDEX ROUTE
const rIndex = require(path.join(__dirname, 'routes', 'index.js'));
app.use('/', rIndex);

// APPEND USERS ROUTE
const rUsers = require(path.join(__dirname, 'routes', 'users.js'));
app.use('/users', rUsers);

// ################################################
// ############# ROUTING - END ####################
// ################################################


// ################################################
// ############# SOCKETS - START ##################
// ################################################
io.on('connection', socket => {
    // Bot and its Messages
    const botName = 'Chat Bot';
    const welcomeMessage = 'Welcome to ';
    const joinChatMessage = ' has joined the chat';
    const leftChatMessage = ' has left the chat';

    console.log('CONNECTION MADE');

    // CHECK USER TOKEN
    socket.on('checkToken', tokenObj => {
        const { token } = tokenObj;
        try {
            const user = jwt.verify(token, accessTokenSecret);
            if(user) {
                socket.emit('authorized', { status: 1, msg: 'User authorized!', username: user.username});
            }
        } catch(err) {
            socket.emit('authorized', { status: 0, msg: 'User not authorized!'});
        }
    });

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome current user
        socket.emit('message', formatMessage(socket.id, botName, `${welcomeMessage} ${user.room} room!`, true));

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(socket.id, botName, `${user.username} ${joinChatMessage}`, true));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Listen for chat message
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        const message = formatMessage(socket.id, user.username, msg);
        io.to(user.room).emit('message', message);
        // saveMessageToDB(message);
    });

    // Runs when client disconnets
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user) {
            io.to(user.room).emit('message', formatMessage(socket.id, botName, `${user.username} ${leftChatMessage}`, true));
            // Update users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});
// ################################################
// ############### SOCKETS - END ##################
// ################################################

const PORT = 9000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));