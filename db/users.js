const bcrypt = require("bcrypt");
const { de } = require("faker/lib/locales");
const client = require("./client");

async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users(username, password)
        VALUES($1, $2)
        RETURNING *;
      `,
      [username, hashedPassword]
    );
    delete user.password;
    return user;
  } catch (error) {
    throw error;
  }
}
async function getUser({ username, password }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1;
      `,
      [username]
    );
    if (!user) return null;
    const hashedPassword = user.password;
    const passwordsMatch = await bcrypt.compare(password, hashedPassword);
    if (passwordsMatch) {
      delete user.password;
      return user;
    } else {
      return false;
    }
  } catch (error) {
    throw error;
  }
}
async function getUserById(id) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
          SELECT *
          FROM users
          WHERE id=$1
        `,
      [id]
    );
    if (!user) {
      throw Error("User does not exist with that id");
    }
    delete user.password;
    return user;
  } catch (error) {
    throw error;
  }
}
async function getUserByUsername(username) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        SELECT *
        FROM users
        WHERE username=$1;
        `,
      [username]
    );
    // if (!user) {
    //   throw Error("User does not exist with that username.");
    // }
    return user;
  } catch (error) {
    throw error;
  }
}
module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
