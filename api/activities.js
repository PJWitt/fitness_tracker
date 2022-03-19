const express = require("express");
const activitiesRouter = express.Router();
const {
  getAllActivities,
  createActivity,
  getPublicRoutinesByActivity,
  updateActivity,
} = require("../db");

activitiesRouter.get("/", async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    console.log(activities, "this is activities");
    res.send(activities);
  } catch (error) {
    next(error);
  }
});
activitiesRouter.post("/", async (req, res, next) => {
  const { name, description } = req.body;
  try {
    if (!req.user) {
      return next({
        name: "userVerificationError",
        message: "Only a logged in user can access their user information!",
      });
    }

    const newActivity = await createActivity({ name, description });
    res.send(newActivity);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
  const { activityId } = req.params;
  try {
    const routineByActivity = await getPublicRoutinesByActivity({
      id: activityId,
    });
    res.send(routineByActivity);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.patch("/:activityId", async (req, res, next) => {
  const { activityId } = req.params;
  const { name, description } = req.body;
  const activity = {
    id: activityId,
    name,
    description,
  };
  try {
    const updatedActivity = await updateActivity(activity);

    res.send(updatedActivity);
  } catch (error) {
    next(error);
  }
});

module.exports = activitiesRouter;
