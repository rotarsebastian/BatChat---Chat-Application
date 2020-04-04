const express = require('express');
const validate = require('../helpers/validation');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { getCurrentRooms } = require('../utils/rooms');


router.post('/register', (req, res) => {
    const form = [...req.body];
    const result = validate(form);

    if(result.status === 0) return res.send({ status: 0, invalids: result.invalidInputs, code: 11 });

    const [ username, password, email ] = form;
    User.findOne({ $or: [ { email : email.val }, { username: username.val }] })
        .then(user => {
            if(user) { 
                if(user.email === email.val && user.username === username.val) return res.send({ status: 0, message: 'Email and username are already taken!', code: 12 }); 
                if(user.username === username.val) return res.send({ status: 0, message: 'Username is already taken!', code: 13 }); 
                if(user.email === email.val) return res.send({ status: 0, message: 'Email is already taken!', code: 14 }); 
            }
            const newUser = new User({
                username: username.val,
                password: password.val,
                email: email.val,
            });

            // Hash password
            bcrypt.genSalt(10, (err, salt) => 
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    // Set password to hashed
                    newUser.password = hash;
                    // Save user
                    newUser.save()
                        .then(user => res.send({ status: 1, message: `SUCCESS: User ${newUser.username} is now created!`, code: 200 }))
                        .catch(err => console.log(err))
            }));
        })

});

// Login Handle
router.post('/login', (req, res) => {
    const form = [...req.body];
    const result = validate(form);

    if(result.status === 0) return res.send({ status: 0, invalids: result.invalidInputs, code: 11 })

    const [ username, password ] = form;

    // Match user
    User.findOne({ username: username.val })
    .then(user => {
        if(!user) { return res.send({ status: 0, message: 'Incorrent username!', code: 15 }); }

        // Match password
        bcrypt.compare(password.val, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch) {
                // Generate an access token
                const accessToken = jwt.sign({ username: user.username }, accessTokenSecret);
                return res.send({ status: 1, message: 'User logged in', token: accessToken, code: 200 });
            } else {
                return res.send({ status: 0, message: 'Incorrent password', code: 16 });
            }
        });
    })
    .catch(err => console.log(err))
});

router.post('/auth', (req, res) => {
    const { token, options } = req.body;
    try {
        const user = jwt.verify(token, accessTokenSecret);
        let response = { status: 1, msg: 'User authorized!', username: user.username };
        if(options === 'rooms') response.rooms = getCurrentRooms();
        if(user) res.status(200).send(response);
    } catch(err) {
        res.status(500).send({ status: 0, msg: 'User not authorized!'});
    }
});

module.exports = router;