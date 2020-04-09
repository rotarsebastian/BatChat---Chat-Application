const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const { formatMessage, saveMessageToDB } = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave } = require('./utils/users');
const { getCurrentRooms, addRoomMember, removeRoomMember, getRoomUsers, resetRoomMembers } = require('./utils/rooms');
const mongoose = require('mongoose');

global.globalVersion = 0;
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

// APPEND ROOMS ROUTE
const rRooms = require(path.join(__dirname, 'routes', 'rooms.js'));
app.use('/rooms', rRooms);

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
    const rewelcomeMessage = 'Hello again to ';
    const joinChatMessage = ' has joined the chat';
    const leftChatMessage = ' has left the chat';

    console.log('SOCKET CONNECTION MADE');

    // CHECK USER TOKEN
    socket.on('checkToken', async(tokenObj) => {
        const { token } = tokenObj;
        try {
            const user = jwt.verify(token, accessTokenSecret);
            if(user) {
                socket.emit('authorized', { status: 1, msg: 'User authorized!', username: user.username, rooms: await getCurrentRooms() });
            }
        } catch(err) {
            socket.emit('authorized', { status: 0, msg: 'User not authorized!'});
        }
    });

    socket.on('joinRoom', async({ username, room }) => {
        const res = userJoin(socket.id, username, room);

        socket.join(res.user.room);
        globalVersion++;
        
        if(res.newAdded) {

            // Update room members
            const response = await addRoomMember(res.user.room, res.user.username);

            if(response.status === 1) {
                // Welcome current user
                socket.emit('message', formatMessage(socket.id, botName, `${welcomeMessage} ${res.user.room} room!`, true));
    
                // Broadcast when a user connects
                socket.broadcast.to(res.user.room).emit('message', formatMessage(socket.id, botName, `${res.user.username} ${joinChatMessage}`, true));
            } else console.log('Error adding user in the room!');

        } else {
            // Welcome current user
            socket.emit('message', formatMessage(socket.id, botName, `${rewelcomeMessage} ${res.user.room} room!`, true));
        }

        // Send users and room info
        io.to(res.user.room).emit('getRoomUsers', {
            users: getRoomUsers(res.user.room)
        });

    });

    //Listen for chat message
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        const message = formatMessage(socket.id, user.username, msg);
        io.to(user.room).emit('message', message);
        // saveMessageToDB(message);
    });

    //Listen for typing message
    socket.on('isTyping', username => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('printIsTyping', username);
    });

    // Runs when client disconnets
    socket.on('disconnect', async() => {
        console.log('USER DISCONNECTED');
        const user = userLeave(socket.id);
        if(user) {
            const response = await removeRoomMember(user.room, user.username);
            if(response.status === 1) {
                io.to(user.room).emit('message', formatMessage(socket.id, botName, `${user.username} ${leftChatMessage}`, true));
                // Update users and room info
                io.to(user.room).emit('getRoomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            } else console.log('Error removing user from room!');
        }
    });
});
// ################################################
// ############### SOCKETS - END ##################
// ################################################

const resetMembers = async() => {
    const result = await resetRoomMembers();
    if(result.status === 1) console.log('Room users have been cleaned!');
        else console.log('Error cleaning the users');
}
resetMembers();


const PORT = 9000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));