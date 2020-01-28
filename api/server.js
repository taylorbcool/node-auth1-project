const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const authRouter = require("../auth/auth-router.js");
const usersRouter = require("../users/users-router.js");

const dbConnection = require("../data/db-config.js");
const KnexSessionStore = require("connect-session-knex")(session);

const sessionConfig = {
  name: "cookieCrisp",
  secret: "keep it secret, keep it safe",
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: false,
    httpOnly: true,
  },
  resave: false,
  saveUninitialized: true,
  store: new KnexSessionStore({
    knex: dbConnection,
    tablename: "sessions",
    sidfieldname: "sid",
    createtable: true,
    clearInterval: 60000,
  }),
};

const server = express();

server.use(helmet());
server.use(session(sessionConfig));
server.use(express.json());
server.use(cors());

server.use("/api/auth", authRouter);
server.use("/api/users", usersRouter);

server.get("/", (req, res) => {
  res.json({ api: "running" });
});

module.exports = server;
