const express = require("express");
const morgan = require("morgan");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const fileStore = require("session-file-store")(session);

// env file processing
require("dotenv").config();

// const auth = require('./authentications/basic_authenication');
// const auth = require('./authentications/cookie_authentication');
const auth = require("./authentications/session_authentication");

const userRouter = require("./routes/user");
const notifiRouter = require("./routes/notifications");

const hostname = "localhost";
const port = 3000;

const connect = mongoose.connect(process.env.DATABASE_URL);

connect.then((db) => {
  if (!db) {
    console.log("Failed! Database connection.");
    return;
  }

  console.log("Database connected!");
});

const app = express();
//cors
app.use(cors());

//using morgan to log the sever requests
app.use(morgan("dev"));

//using cookie parser to parse the cookies
// app.use(cookieParser(process.env.COOKIE_SECRET_KEY));

//using express-session to set-up express session
app.use(
  session({
    name: "session-id",
    secret: process.env.SESSION_SECRET_KEY,
    saveUninitialized: false,
    resave: false,
    store: new fileStore(),
  })
);

//authentication
app.use(auth);

//serving static files of public folder
app.use(express.static(__dirname + "/public"));

app.use("/user", userRouter);
app.use("/notification", notifiRouter);

app.use((req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end(
    `<html><body><p>Welcome to the express application.</p></body></html>`
  );
});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server is running at http://${hostname}:${port}`);
});
