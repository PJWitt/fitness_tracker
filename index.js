// create the express server here
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRouter = require("./api");
const client = require("./db/client");
const jwt = require("jsonwebtoken");
const { getUserById } = require("./db");
const app = express();

client.connect();

app.use(cors());
app.use(express.json());
// app.use(async (req, res, next) => {
//   if (!req.headers.authorization) {
//     return next();
//   }
//   const auth = req.headers.authorization.split(" ")[1];
//   const _user = jwt.decode(auth, process.env.JWT_SECRET);
//   if (!_user) {
//     return next();
//   }
//   const user = await getUserById(_user.id);
//   req.user = user;
//   next();
// });

app.use("/api", apiRouter);

app.listen(3000, () => {
  console.log("server is up!");
});
