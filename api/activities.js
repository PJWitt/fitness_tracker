const express = require("express");
const activitiesRouter = express.Router();
const { requireUser } = require("./utils");
const {
  getAllActivities,
  createActivity,
  getPublicRoutinesByActivity,
} = require("../db");
activitiesRouter.get("/", async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    res.send(activities);
  } catch (error) {
    next(error);
  }
});
activitiesRouter.post("/", async (req, res, next) => {
  const { name, description } = req.body;
  try {
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
module.exports = activitiesRouter;
