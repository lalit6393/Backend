const crypto = require('crypto');
const Users = require('../models/user');

const auth = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if(!authHeader)
    {
      res.statusCode = 401;
      res.send("You are not authenticated!");
      return; 
    }

    const user = new Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");
    const [username, password] = user;

    // console.log(username, password);

    if(username && password)
    {
        const hash = crypto.createHash('sha256', process.env.SECRET_HASH_KEY).update(password).digest('hex');
        Users.findOne({username: username})
        .then((user) => {
            console.log(user);
            if(!user)
            {
              res.statusCode = 404;
              res.send("User not found!");
              return;
            }

            if(hash === user.password) next();
            else
            {
              res.statusCode = 401;
              res.send("Incorrect password!");
            }
        })
        .catch(err => {
            res.statusCode = 401;
            res.send({error: err});
        });
    }
};

module.exports = auth;