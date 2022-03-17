// build and export your unconnected client here
const { Client } = require("pg"); // imports the pg module

const client = new Client(
  process.env.DATABASE_URL || "postgres://localhost:5432/fitness-dev"
);

module.exports = {
  client,
};
