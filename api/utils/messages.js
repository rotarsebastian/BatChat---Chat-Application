const moment = require('moment');

const formatMessage = (id, username, text, isbot) => {
    let fromBot = false;
    if(!!isbot) fromBot = true;
    return {
        id,
        username,
        text,
        time: moment().format('h:mm a'),
        fromBot: fromBot
    }
}

const saveMessageToDB = message => {
    if(message.fromBot) return;
    try {
        // db.collection('messages').insertOne(message, (err, dbResponse) => {
        //     if(err) { return console.log('mongo cannot add message'); }
        //     return console.log(`{ "status": 1, "message": "Message added successfully!" }`);
        // });
    }
    catch(ex) {
        return console.log('System under update!');
    }
}

const getMessages = roomID => {
    try {
        const results = db.collection('messages').find({}).sort({ _id: -1 }).limit(10);
        console.log(results);
    }
    catch(ex) {
        return console.log('System under update!');
    }
}

module.exports = { formatMessage, saveMessageToDB, getMessages };