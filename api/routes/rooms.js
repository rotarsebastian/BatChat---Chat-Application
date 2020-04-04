const express = require('express');
const router = express.Router();
const { getCurrentRooms, addNewRoom, isRoomNameAvailable } = require('../utils/rooms');
let timer;

router.post('/', (req, res) => {
    const { roomName, username } = req.body;
    const newRooms = addNewRoom(roomName, username);
    if(newRooms) res.status(200).json({ status: 1, rooms: newRooms});
});

router.get('/available/:roomName', (req, res) => {
    const { roomName } = req.params;
    const foundRoom = isRoomNameAvailable(roomName);
    if(foundRoom === -1) res.status(200).json({ status: 1, isAvailable: 1});
        else res.status(200).json({ status: 0, isAvailable: 0});
});

// #####################################
router.get('/sse', (req, res) => {
    res.set('Content-Type', 'text/event-stream');
    res.set('Connection', 'keep-alive');
    res.set('Cache-Control', 'no-cache');
    res.set('Access-Control-Allow-Origin', '*');
    console.log('Client connected to SSE!');
    setInterval(() => {
        res.status(200).write(`data: ${JSON.stringify(getCurrentRooms())}\n\n`);
    }, 1000);

    res.on('close', () => {
        if (!res.finished) {
            console.log("SSE is now CLOSED");
        }
    });
});

module.exports = router;