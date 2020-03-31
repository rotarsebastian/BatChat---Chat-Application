import request from 'request-promise';

const login = async(username, password) => {
    
    try {
        const options = {
            method: 'POST',
            uri: 'http://127.0.0.1:9000/users/login',
            body: [ username, password ],
            json: true 
        };
        const response = await request(options);
        return response;
    }
    catch(err) {
        return console.log('Server under maintanence!', err);
    }
};

export default login;