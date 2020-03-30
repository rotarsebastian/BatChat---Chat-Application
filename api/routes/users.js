const express = require('express');
const validate = require('../helpers/validation');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.post('/register', (req, res) => {
    const form = [...req.body];
    const isValid = validate(form);

    if(!isValid) {
        return res.send({ status: 0, message: 'Invalid form', code: 11 });
    }
    const [ username, password, email ] = form;
    User.findOne({ $or: [ { email : email.val }, { username: username.val }] })
        .then(user => {
            if(user) { return res.send({ status: 0, message: 'username or email is already taken', code: 12 }); }
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
    const isValid = validate(form);

    if(!isValid) {
        return res.send({ status: 0, message: 'Invalid form', code: 11 });
    }
    const [ username, password ] = form;

    // Match user
    User.findOne({ username: username.val })
    .then(user => {
        if(!user) { return res.send({ status: 0, message: 'User does not exist', code: 13 }); }

        // Match password
        bcrypt.compare(password.val, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch) {
                // Generate an access token
                const accessToken = jwt.sign({ username: user.username }, accessTokenSecret);
                return res.send({ status: 1, message: 'User logged in', token: accessToken, code: 200 });
            } else {
                return res.send({ status: 0, message: 'Incorrent password', code: 14 });
            }
        });
    })
    .catch(err => console.log(err))
});

module.exports = router;