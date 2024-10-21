"use strict";
const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");

// Route to get all users
router.get("/allusers", controller.getAllUsers);

// Route to get workout plan recommendations using reinforcement learning
router.get("/recommendations", controller.getRecommendedPlans);

// Route to submit feedback for a workout plan
router.post("/feedback", controller.submitPlanFeedback);

module.exports = router;


// TODO: add decaying epsilon so that the model explores less as it learns more from user feedback
// TODO: individual q-values for users (done?)
// TODO: formatting of 'state' in q_tables
// TODO: consider muscle groups
// TODO: no more cals, need to store and consider injuries
// TODO: exercises api?
// TODO: logging and considering plan history
// todo: allow users to crud accounts, progress tracking, injuries / injury status and accomidations, goals and goal tracking
// todo: allow users to crud workouts, exercises, and preferences
// todo: consider injury status in RL
// todo: auto increment user_preferences preference_id when creating new user preferences?

// db notes (may not apply as i have changed the db some)
// similar exercises should have the same workout_id in the exercises table ie legs should all have workout_id 2
// match types and intensities in the workouts table with the correct corresponding workout_id value in exercises table ie bench press workout_id values in exercises should be correlated to type strength in the workouts table
// exercise_id's can / must be different as they are different exercises
// need injuries table, might just need injuries column in user_preferences instead