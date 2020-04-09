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

module.exports = { formatMessage };