import request from 'request-promise';

export const createRoom = async(roomName, username) => {
    
    try {
        const options = {
            method: 'POST',
            uri: 'http://127.0.0.1:9000/rooms',
            body: { roomName, username },
            json: true 
        };
        const response = await request(options);
        return response;
    }
    catch(err) {
        return console.log('Server under maintanence!', err);
    }
};

