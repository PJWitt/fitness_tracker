const client = require("./client");
const { getUserByUsername } = require("./users");

async function addActivitiesToRoutines(routines) {
  try {
    for (let i = 0; i < routines.length; i++) {
      let activities = [];
      let routineId = routines[i].id;

      const {
        rows: [user],
      } = await client.query(
        `
        SELECT username
        FROM users
        WHERE "id"=$1;
      `,
        [routines[i].creatorId]
      );

      routines[i].creatorName = user.username;

      const { rows: routine_activities } = await client.query(
        `
        SELECT * 
        FROM "routine_activities"
        WHERE "routineId"=$1;
      `,
        [routineId]
      );

      for (let j = 0; j < routine_activities.length; j++) {
        let activityId = routine_activities[j].activityId;

        const { rows: activitiy } = await client.query(
          `
          SELECT * 
          FROM activities
          WHERE "id"=$1;
        `,
          [activityId]
        );

        activities.push(activitiy[0]);
      }

      routines[i].activities = activities;

      for (let k = 0; k < routines[i].activities.length; k++) {
        let activityId = routines[i].activities[k].id;

        const routine_activity = await client.query(
          `
          SELECT * 
          FROM "routine_activities"
          WHERE "activityId"=$1;
        `,
          [activityId]
        );

        routines[i].activities[k].count = routine_activity.rows[0].count;
        routines[i].activities[k].duration = routine_activity.rows[0].duration;
      }
    }

    return routines;
  } catch (error) {
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(`
      SELECT *
      FROM routines
      WHERE id=${id}
    `);

    if (!routine) {
      throw Error("Routine does not exist with that id");
    }

    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows: routines } = await client.query(`
      SELECT *
      FROM routines 
   `);

    return routines;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT *
      FROM routines;
    `);

    return await addActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(
      `
      SELECT *
      FROM routines
      WHERE "isPublic"=$1;
    `,
      [true]
    );

    return await addActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const user = await getUserByUsername(username);
    const { id } = user;

    const { rows: routines } = await client.query(
      `
      SELECT *
      FROM routines
      WHERE "creatorId"=$1;
    `,
      [id]
    );

    return await addActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

// getPublicRoutinesByUser
// getPublicRoutinesByUser({ username })
// select and return an array of public routines made by user, include their activities
async function getPublicRoutinesByUser({ username }) {
  try {
    const user = await getUserByUsername(username);
    const { id } = user;

    const { rows: routines } = await client.query(
      `
          SELECT *
          FROM routines
          WHERE ("creatorId"=$1 AND "isPublic"=$2);
          `,
      [id, true]
    );

    return await addActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}
// getPublicRoutinesByActivity
// getPublicRoutinesByActivity({ id })
// select and return an array of public routines which have a specific activityId in their routine_activities join, include their activities
async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines_activities } = await client.query(
      `
            SELECT *
            FROM "routine_activities"
            WHERE "activityId"=$1;
            `,
      [id]
    );

    let filterdRoutines = [];

    for (let i = 0; i < routines_activities.length; i++) {
      const routineId = routines_activities[i].routineId;
      console.log(routineId);

      const { rows: routines } = await client.query(
        `
          SELECT *
          FROM routines
          WHERE ("id"=$1 AND "isPublic"=$2);
          `,
        [routineId, true]
      );

      filterdRoutines.push(routines[0]);
    }

    return await addActivitiesToRoutines(filterdRoutines);
  } catch (error) {
    throw error;
  }
}

// createRoutine
// createRoutine({ creatorId, isPublic, name, goal })
// create and return the new routine
async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
        INSERT INTO routines("creatorId", "isPublic", name, goal)
        VALUES($1, $2, $3, $4)
        RETURNING *;
      `,
      [creatorId, isPublic, name, goal]
    );

    return routine;
  } catch (error) {
    throw error;
  }
}

// updateRoutine
// updateRoutine({ id, isPublic, name, goal })
// Find the routine with id equal to the passed in id
// Don't update the routine id, but do update the isPublic status, name, or goal, as necessary
// Return the updated routine
async function updateRoutine({ id, isPublic, name, goal }) {
  try {
    let updatedRoutine = await getRoutineById(id);
    // If it doesn't exist, throw an error with a useful message
    if (!updatedRoutine) {
      throw Error("Activity does not exist with that id");
    }
    //update the activity if there are no failures, as above
    if (isPublic) {
      await client.query(
        `
          UPDATE routines
          SET "isPublic"=$1
          WHERE id=$2
          RETURNING *;
        `,
        [isPublic, id]
      );
    }

    if (name) {
      await client.query(
        `
          UPDATE routines
          SET name=$1
          WHERE id=$2
          RETURNING *;
        `,
        [name, id]
      );
    }

    if (goal) {
      await client.query(
        `
          UPDATE routines
          SET goal=$1
          WHERE id=$2
          RETURNING *;
        `,
        [goal, id]
      );
    }

    updatedRoutine = await getRoutineById(id);
    return updatedRoutine;
  } catch (error) {
    throw error;
  }
}

// destroyRoutine
// destroyRoutine(id)
// remove routine from database
// Make sure to delete all the routine_activities whose routine is the one being deleted.
async function destroyRoutine(id) {
  try {
    await client.query(
      `
      DELETE
      FROM routines
      WHERE id=$1;
      `,
      [id]
    );

    await client.query(
      `
      DELETE
      FROM "routine_activities"
      WHERE "routineId"=$1;
      `,
      [id]
    );

    const message = {
      success: true,
      error: "none",
      message: "routines successfully deleted",
    };
    return message;
  } catch (error) {
    throw error;
  }
}
module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  destroyRoutine,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  updateRoutine,
  createRoutine,
};
