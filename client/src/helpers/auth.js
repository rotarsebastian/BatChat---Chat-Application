import request from 'request-promise';

const auth = async(token, config) => {
    
    try {
        let bodyData = { token };
        if(config) bodyData.options = config;
        const options = {
            method: 'POST',
            uri: 'http://127.0.0.1:9000/users/auth',
            body: bodyData,
            json: true 
        };
        const response = await request(options);
        return response;
    }
    catch(err) {
        return console.log('Server under maintanence!', err);
    }
};

export default auth;