const express = require("express");
const routine_activitiesRouter = express.Router();
const {
  destroyRoutineActivity,
  getRoutineActivityById,
  getRoutineById,
  updateRoutineActivity,
  getUserIdByRoutineActivityId,
} = require("../db");

routine_activitiesRouter.delete(
  "/:routineActivitiesId",
  async (req, res, next) => {
    const { routineActivitiesId } = req.params;
    console.log(req.params, "req params");
    try {
      if (!req.user) {
        return next({
          name: "userVerificationError",
          message: "Only a logged in user can access their user information!",
        });
      }

      const routineActivityById = await getRoutineActivityById(
        routineActivitiesId
      );
      const routine = await getRoutineById(routineActivityById.routineId);
      if (routine.creatorId !== req.user.id) {
        next({
          name: "UnauthorizedUserError",
          message: "You cannot delete a routine you have not created",
        });
      }

      const routineActivity = await destroyRoutineActivity(routineActivitiesId);
      res.send(routineActivity);
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

routine_activitiesRouter.patch(
  "/:routineActivitiesId",
  async (req, res, next) => {
    if (!req.user) {
      return next({
        name: "userVerificationError",
        message: "Only a logged in user can access their user information!",
      });
    }

    const { routineActivitiesId } = req.params;
    const { count, duration } = req.body;
    const routineActivity = {
      id: routineActivitiesId,
      count,
      duration,
    };
    try {
      const routineActivityById = await getRoutineActivityById(
        routineActivitiesId
      );

      const routine = await getRoutineById(routineActivityById.routineId);
      if (routine.creatorId !== req.user.id) {
        res.status(401);
        throw {
          name: "Unauthorized user",
          message: "You cannot edit it",
        };
      }

      const updatedRoutineActivity = await updateRoutineActivity(
        routineActivity
      );

      res.send(updatedRoutineActivity);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = routine_activitiesRouter;
