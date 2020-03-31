import request from 'request-promise';

const register = async(username, password, email) => {
    
    try {
        const options = {
            method: 'POST',
            uri: 'http://127.0.0.1:9000/users/register',
            body: [ username, password, email ],
            json: true 
        };
        const response = await request(options);
        return response;
    }
    catch(err) {
        return console.log('Server under maintanence!', err);
    }
};

export default register;