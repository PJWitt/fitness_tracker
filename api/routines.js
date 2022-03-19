const express = require("express");
const { CommandCompleteMessage } = require("pg-protocol/dist/messages");
const routinesRouter = express.Router();
const {
  getAllPublicRoutines,
  destroyRoutine,
  getRoutineById,
  createRoutine,
  updateRoutine,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
} = require("../db");

routinesRouter.get("/", async (req, res) => {
  const routines = await getAllPublicRoutines();
  res.send(routines);
});

routinesRouter.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return next({
        name: "userVerificationError",
        message: "Only a logged in user can access their user information!",
      });
    }
    const creatorId = req.user.id;
    const { isPublic, name, goal } = req.body;

    const newRoutine = await createRoutine({ creatorId, isPublic, name, goal });

    res.send(newRoutine);
  } catch (error) {
    next(error);
  }
});

routinesRouter.delete("/:routineId", async (req, res, next) => {
  const { routineId } = req.params;
  try {
    if (!req.user) {
      return next({
        name: "userVerificationError",
        message: "Only a logged in user can access their user information!",
      });
    }

    const routineById = await getRoutineById(routineId);

    if (routineById.creatorId !== req.user.id) {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot delete a routine you have not created",
      });
    }
    const routine = await destroyRoutine(routineId);
    console.log(routine, "routine");
    res.send(routine);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

routinesRouter.patch("/:routineId", async (req, res, next) => {
  const { routineId } = req.params;
  const { isPublic, name, goal } = req.body;
  const routine = {
    id: routineId,
    isPublic,
    name,
    goal,
  };
  try {
    if (!req.user) {
      return next({
        name: "userVerificationError",
        message: "Only a logged in user can access their user information!",
      });
    }

    const updatedRoutine = await updateRoutine(routine);

    res.send(updatedRoutine);
  } catch (error) {
    next(error);
  }
});

routinesRouter.post("/:routineId/activities", async (req, res, next) => {
  try {
    const { activityId, count, duration } = req.body;
    const { routineId } = req.params;

    const newRoutine = await addActivityToRoutine({
      routineId,
      activityId,
      count,
      duration,
    });
    console.log(newRoutine, "new routine");
    res.send(newRoutine);
  } catch (error) {
    next(error);
  }
});

module.exports = routinesRouter;
