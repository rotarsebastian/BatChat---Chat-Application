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
        const { status } = response;
        console.log(response);
        if(status === 0) {
            console.log('Unable to login user!');
            return false;
        } else {
            return response.token;
        }
    }
    catch(err) {
        return console.log('Unable to connect to location service!', err);
    }
};

export default login;