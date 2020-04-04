const users = [];

// Join user to chat
const userJoin = (id, username, room) => {
    const userAlreadyInRoom = users.find(user => user.username === username);
    if(!userAlreadyInRoom) {
        const user = { id, username, room };
        users.push(user);
        return { user: user, newAdded: true };
    }
    return { user: userAlreadyInRoom, newAdded: false };
}

// Get the current user
const getCurrentUser = (id) => {
    return users.find(user => user.id === id);
}

// User leaves chat
const userLeave = (id) => {
    const index = users.findIndex(user => user.id === id);
    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// Get room user
const getRoomUsers = (id) => {
    return users.filter(user => user.room === id);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
}