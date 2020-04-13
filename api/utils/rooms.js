const Room = require('../models/Room');
let rooms = [ { _id: 0, name: 'General', users: [] } ];

// Get current rooms
const getCurrentRooms = async() => {
    await Room.find({}, (err, result) => {
        if (err) return console.log(err);
            else rooms = result;
    });
    return rooms;
}

const getFirstRooms = (cb) => {
    Room.find({}).limit(5).sort([['date', -1]]).exec((err, result) => {
        if (err) return console.log(err);
            else cb(result);
    });
}

const getMoreRooms = (skip, cb) => {
    Room.find({}).skip(skip).limit(5).sort([['date', -1]]).exec((err, result) => {
        if (err) return console.log(err);
            else cb(result);
    });
}

// Add room member
const addRoomMember = async(room, username) => {
    let updated = false;
    const roomToUpdate = rooms.find(r => r.name === room);
    const userIndex = roomToUpdate.users.findIndex(user => user === username);
    if(userIndex === -1) roomToUpdate.users.push(username);
        else return { status: 0, updatedRoom: 'User already in room'};

    updated = await Room.updateOne({ name: room }, roomToUpdate, {upsert: true}, (err, doc) => {
        if (err) { console.log(err); return false; }
        return true;     
    });

    if(updated) return { status: 1, updatedRoom: roomToUpdate};
        else return { status: 0, updatedRoom: roomToUpdate};
}

// Remove room member
const removeRoomMember = async(room, username) => {
    let updated = false;
    const roomToUpdate = rooms.find(r => r.name === room);
    const indexUser = roomToUpdate.users.findIndex(user => user === username);
    if(indexUser !== -1) roomToUpdate.users.splice(indexUser, 1);
        else return { status: 0, updatedRoom: 'User not in room anymore'};

    updated = await Room.updateOne({ name: room }, roomToUpdate, {upsert: true}, (err, doc) => {
        if (err) { console.log(err); return false; }
        return true;     
    });

    if(updated) return { status: 1, updatedRoom: roomToUpdate};
        else return { status: 0, updatedRoom: roomToUpdate};
}


// Check if room exists 
const isRoomNameAvailable = roomName => {
    return rooms.findIndex(room => room.name.toLowerCase() === roomName.toLowerCase());
}

// Get room user
const getRoomUsers = room => {
    const foundRoom = rooms.find(r => r.name === room);
    const users = [...foundRoom.users];
    return users;
}

// Get room user
const resetRoomMembers = async() => {
    let updated = false;

    updated = await Room.updateMany({}, { users: [] }, {upsert: true}, (err, doc) => {
        if (err) { console.log(err); return false; }
        return true;     
    });

    if(updated) return { status: 1 };
        else return { status: 0 };
}

// Save message to DB
const saveMessageToDB = async(room, message) => {
    if(message.fromBot) return;

    let updated = false;
    const roomToUpdate = rooms.find(r => r.name === room);
    roomToUpdate.messages.push(message);

    updated = await Room.updateOne({ name: room }, roomToUpdate, {upsert: true}, (err, doc) => {
        if (err) { console.log(err); return false; }
        return true;     
    });

    if(updated) return { status: 1, updatedRoom: roomToUpdate};
        else return { status: 0, updatedRoom: roomToUpdate};
}

// Get messages from one room
const getRoomMessages = room => {
    const foundRoom = rooms.find(r => r.name === room);
    const messages = [...foundRoom.messages];
    return messages;
}

// Get touched room
const getTouchedRoom = room => {
    return rooms.find(r => r.name === room);
}

module.exports = {
    getCurrentRooms,
    addRoomMember,
    removeRoomMember,
    isRoomNameAvailable,
    getRoomUsers,
    resetRoomMembers,
    saveMessageToDB,
    getRoomMessages,
    getMoreRooms,
    getFirstRooms,
    getTouchedRoom
}