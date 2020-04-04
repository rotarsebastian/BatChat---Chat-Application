const express = require('express');
const router = express.Router();
const { getCurrentRooms, addNewRoom } = require('../utils/rooms');

router.post('/', (req, res) => {
    const { roomName, username } = req.body;
    const newRooms = addNewRoom(roomName, username);
    if(newRooms) res.status(200).json({ status: 1, rooms: newRooms});
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
});


module.exports = router;