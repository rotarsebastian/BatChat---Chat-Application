const rooms = [ { name: 'General', users: [] } ];

// Get current rooms
const getCurrentRooms = () => {
    return rooms;
}

// Create new room
const addNewRoom = (roomName, username) => {
    rooms.push({ name:roomName, users: [username] });
    return rooms;
}

module.exports = {
    getCurrentRooms,
    addNewRoom
}