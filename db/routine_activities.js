const client = require("./client");

async function getRoutineActivityById(id) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
      SELECT *
      FROM routine_activities
      WHERE id=$1;
    `,
      [id]
    );

    // if (!routine_activity) {
    //   throw Error("routine_activity with that id does not exist");
    // }

    return routine_activity;
  } catch (error) {
    throw error;
  }
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  //not sure about this one, might be doing it completely wrong.
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
        INSERT INTO "routine_activities"("routineId", "activityId", count, duration) 
        VALUES($1, $2, $3, $4)
        RETURNING *;
        `,
      [routineId, activityId, count, duration]
    );

    return routine_activity;
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity({ id, count, duration }) {
  try {
    let routine_activity = await getRoutineActivityById(id);

    // If it doesn't exist, throw an error with a useful message
    // if (!routine_activity) {
    //   throw Error("routine_activity does not exist with that id");
    // }

    //update the activity if there are no failures, as above
    await client.query(
      `
        UPDATE "routine_activities"
        SET "count"=$1, "duration"=$2
        WHERE id=$3
        RETURNING *;
        `,
      [count, duration, id]
    );

    routine_activity = await getRoutineActivityById(id);
    //or we might just be able to return routine_activity without having to
    //call the getRoutineActivityById function again. we can test that later.
    return routine_activity;
  } catch (error) {
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
            DELETE
            FROM routine_activities
            WHERE id=$1
            RETURNING *;
        `,
      [id]
    );

    return routine_activity;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  //not sure about this one either.
  try {
    const routine_activities = await client.query(
      `
        SELECT *
        FROM "routine_activities" 
        WHERE "routineId"=$1;
        `,
      [id]
    );
    return routine_activities.rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  getRoutineActivitiesByRoutine,
};
