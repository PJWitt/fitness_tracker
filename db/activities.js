const client = require("./client");
async function createActivity({ name, description }) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
        INSERT INTO activities(name, description)
        VALUES($1, $2)
        RETURNING *;
        `,
      [name, description]
    );
    return activity;
  } catch (error) {
    throw error;
  }
}
async function getAllActivities() {
  try {
    const { rows: activities } = await client.query(`
          SELECT *
          FROM activities;
        `);
    return activities;
  } catch (error) {
    throw error;
  }
}
async function getActivityById(id) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      SELECT *
      FROM activities
      WHERE id=$1;
    `,
      [id]
    );
    if (!activity) {
      throw Error("activity with that id does not exist");
    }
    return activity;
  } catch (error) {
    throw error;
  }
}
async function updateActivity({ id, name, description }) {
  try {
    let activity = await getActivityById(id);
    // If it doesn't exist, throw an error with a useful message
    if (!activity) {
      throw Error("Activity does not exist with that id");
    }
    //update the activity if there are no failures, as above
    await client.query(
      `
      UPDATE activities
      SET name=$1
      WHERE id=$2
      RETURNING *;
    `,
      [name, id]
    );
    await client.query(
      `
      UPDATE activities
      SET description=$1
      WHERE id=$2
      RETURNING *;
    `,
      [description, id]
    );
    activity = await getActivityById(id);
    //or we might just be able to return activity without having to
    //call the getActivityById function again. we can test that later.
    return activity;
  } catch (error) {
    throw error;
  }
}
module.exports = {
  createActivity,
  getAllActivities,
  getActivityById,
  updateActivity,
};
