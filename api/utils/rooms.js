
const { v4: uuidv4 } = require('uuid');

const rooms = [ { id: 0, name: 'General', users: [] } ];

// Get current rooms
const getCurrentRooms = () => {
    return rooms;
}

// Create new room
const addNewRoom = (roomName, username) => {
    rooms.push({ id: uuidv4(), name:roomName, users: [] });
    return rooms;
}

// Add room member
const addRoomMember = (room, username) => {
    const roomToUpdate = rooms.find(r => r.name === room);
    const roomToUpdateIndex = rooms.findIndex(r => r.name === room);
    const newRoomObject = { ...roomToUpdate };
    newRoomObject.users.push(username);
    rooms[roomToUpdateIndex] = newRoomObject;
    return newRoomObject;
}

// Remove room member
const removeRoomMember = (room, username) => {
    const roomToUpdate = rooms.find(r => r.name === room);
    const roomToUpdateIndex = rooms.findIndex(r => r.name === room);
    const newRoomObject = { ...roomToUpdate };
    const indexUser = newRoomObject.users.findIndex(user => user === username);
    if(indexUser !== -1) newRoomObject.users.splice(indexUser, 1);
    rooms[roomToUpdateIndex] = newRoomObject;
    console.log(rooms);
    return newRoomObject;
}

module.exports = {
    getCurrentRooms,
    addNewRoom,
    addRoomMember,
    removeRoomMember
}