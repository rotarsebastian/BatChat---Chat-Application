const express = require('express');
const validate = require('../helpers/validation');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.post('/register', (req, res) => {
    const form = [...req.body];
    const result = validate(form);

    if(result.status === 0) return res.send({ status: 0, invalids: result.invalidInputs, code: 11 });

    const [ username, password, email ] = form;
    User.findOne({ $or: [ { email : email.val }, { username: username.val }] })
        .then(user => {
            if(user) { 
                if(user.email === email.val && user.username === username.val) return res.send({ status: 0, message: 'both email and username are already taken', code: 13 }); 
                if(user.email === email.val) return res.send({ status: 0, message: 'email is already taken', code: 14 }); 
                if(user.username === username.val) return res.send({ status: 0, message: 'username is already taken', code: 15 }); 
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
    console.log(req.body);
    const form = [...req.body];
    const result = validate(form);

    if(result.status === 0) return res.send({ status: 0, invalids: result.invalidInputs, code: 11 })

    const [ username, password ] = form;

    // Match user
    User.findOne({ username: username.val })
    .then(user => {
        if(!user) { return res.send({ status: 0, message: 'User does not exist', code: 22 }); }

        // Match password
        bcrypt.compare(password.val, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch) {
                // Generate an access token
                const accessToken = jwt.sign({ username: user.username }, accessTokenSecret);
                return res.send({ status: 1, message: 'User logged in', token: accessToken, code: 200 });
            } else {
                return res.send({ status: 0, message: 'Incorrent password', code: 23 });
            }
        });
    })
    .catch(err => console.log(err))
});

module.exports = router;