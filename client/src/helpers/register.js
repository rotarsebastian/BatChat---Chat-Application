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
        const { status } = response;
        console.log(response);
        if(status === 0) {
            console.log('Unable to register user!');
            return false;
        } else {
            return true;
        }
    }
    catch(err) {
        return console.log('Unable to connect to location service!', err);
    }
};

export default register;