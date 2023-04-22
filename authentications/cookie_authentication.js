const crypto = require("crypto");
const Users = require("../models/user");

const auth = (req, res, next) => {
  //   console.log(req.signedCookies);

  if (!req.signedCookies?.username) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.statusCode = 401;
      res.send("Auth header not found!");
      return;
    }

    const user = new Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");
    const [username, password] = user;

    if (username && password) {
      const hash = crypto
        .createHash("sha256", process.env.SECRET_HASH_KEY)
        .update(password)
        .digest("hex");

      Users.findOne({ username: username })
        .then((user) => {
          if (!user) {
            res.statusCode = 401;
            res.send("User not found!");
            return;
          }

          if (user.password === hash) {
            res.cookie("username", user.username, { signed: true });
            next();
          } else {
            res.statusCode = 401;
            res.send("Incorrect Password!");
          }
        })
        .catch((err) => {
          res.statusCode = 401;
          res.send({ error: err });
        });
    } else {
      res.statusCode = 401;
      res.send("Username or password not found!");
    }
  } else {
    Users.findOne({ username: req.signedCookies.username })
      .then((user) => {
        if (!user) {
          res.statusCode = 401;
          res.send("User not found!");
          return;
        }

        next();
      })
      .catch((err) => {
        res.statusCode = 401;
        res.send("User not found!");
        return;
      });
  }
};

module.exports = auth;
