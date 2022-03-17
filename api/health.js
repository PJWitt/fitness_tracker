const express = require("express");
const healthRouter = express.Router();

healthRouter.get("/", async (req, res) => {
  const message = "All is well! Sever is up!";

  res.send({
    message,
  });
});

module.exports = healthRouter;
