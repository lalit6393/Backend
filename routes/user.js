const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const Users = require('../models/user');

const userRouter = express.Router();

userRouter.use(bodyParser.json());

// userRouter.route('/')
// .get((req, res, next) => {
//     res.send(`<html><body><p>Hi this is user GET route.</p></body></html>`);
// })
// .post((req, res, next) => {
//     res.send(`<html><body><p>Hi this user POST request.</p></body></html>`);
// })
// .put((req, res, next) => {
//     res.send(`<html><body><p>this is the put route.</p></body></html>`)
// });

userRouter.post('/signup', (req, res, next) => {

    const newuser = {};
    newuser.username = req.body.username;

    if(req.body?.password){
        newuser.password = crypto.createHash('sha256', process.env.SECRET_HASH_KEY).update(req.body.password).digest('hex');
    }

        Users.create(newuser)
        .then((user) => {
            
            if(!user)
            {
                res.statusCode = 500;
                res.send("Failed to create user!");
                return;
            }

            res.statusCode = 200;
            res.send(user);
        })    
        .catch((err) => {
            res.statusCode = 400;
            res.send(err);
        });
});

//login to set cookies

userRouter.post('/login', (req, res, next) => {
     if(req.body?.username && req.body?.password)
     {
        const hash = crypto.createHash('sha256', process.env.SECRET_HASH_KEY).update(req.body?.password).digest('hex');
        Users.findOne({username:req.body?.username})
        .then((user) => {
          if(!user)
          {
            res.statusCode = 401;
            res.send("User Not ");
          }
        })
        .catch((err) => {
            res.statusCode = 401;
            res.send({error: err});
        })
     }
});

module.exports = userRouter;