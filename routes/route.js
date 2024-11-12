"use strict";
const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");
const crudController = require("../controllers/crudcontroller");

// Route to get all users
router.get("/allusers", controller.getAllUsers);

// Route to get workout plan recommendations using reinforcement learning
router.get("/recommendations", controller.getRecommendedPlans);

// Route to submit feedback for a workout plan
router.post("/feedback", controller.submitPlanFeedback);

//route for muscles to see if muscles are posted
router.get("/allmuscles",controller.getAllMuscles);

router.get("/userprofile/:user_id",controller.getUser);

router.get("/login",controller.getLogin);

//module.exports = router;



// ADDED
/* router.get('/users/create', (req, res) => {
    res.render('create-user', { error: null, message: null });
}); */

router.post('/users/create', crudController.createUser);
router.get('/users/:user_id', crudController.getUser);
router.post('/users/update/:user_id', crudController.updateUser);
// router.post('/users/update', crudController.updateUser);
router.get('/preferences/:user_id', crudController.getPreferences);
// router.post('/preferences/update', crudController.updatePreferences);
router.post('/preferences/update/:user_id', crudController.updatePreferences);
/* router.get('/preferences/create', (req, res) => {
    res.render('create-preferences', { error: null, message: null });
}); */
router.post('/preferences/create', crudController.createPreferences);
router.post('/injury/create', crudController.createInjury);
router.post('/workoutperformance/create', crudController.createWorkoutPerformance);
router.post('/workoutperformance/update', crudController.updateWorkoutPerformance);
router.post('/workoutperformance/:user_id', crudController.getWorkoutPerformance);

// COLLIN ADDED
router.get("/userworkouthistory/:user_id",controller.getUserHistory);



// Main TODOs
// TODO: feedback does not to be resubmitted per refresh (done?)
// TODO: state changes (update user fit_goal and experience level directly in db when state changes), all of this is done in the model
// TODO: injury and muscle filtering (muscle filtering done in getWorkoutPlans?)
// TODO: change to hosted db

// use updateUserState in controller to update state after state change?
// keep determineNextState in submitPlanFeedback, remove it from recommendWorkoutPlansWithRL





module.exports = router;

// TODO: add decaying epsilon so that the model explores less as it learns more from user feedback
// TODO: individual q-values for users (done)
// TODO: formatting of 'state' in q_tables
// TODO: consider muscle groups
// TODO: no more cals, need to store and consider injuries
// TODO: exercises api?
// TODO: logging and considering plan history
// TODO: allow users to crud accounts, progress tracking, injuries / injury status and accomidations, goals and goal tracking
// TODO: allow users to crud workouts, exercises, and preferences
// I have most of this crud stuff done
// TODO: consider injury status in RL
// TODO: auto increment user_preferences preference_id when creating new user preferences?
// TODO: change how next state is represented? currently current state concat with rating value
// TODO: handling states
// TODO: track and account for reps
// TODO; workout search and filtering
// TODO: add more actions to states, same state name should have multiple actions (different action values)
// TODO: similar workouts should have same plan_id value in workouts table? action in q tables is plan id. users should have multiple of the same ->
// -> named states but with different action values for each? ie ->
// ->                        state              action (plan id)    q value
//                           strengthadvanced5  1                   0.75
//                           strengthadvanced5  2                   0.60
//                           strengthadvanced5  3                   0.50
// -> highest q value will be chosen as next action so action should be similar in category ie all strengthadvanced5 should be of chest workout type? so that similar category
// -> of workout can be recommended ie plan id 1 - bicep curl plan id 2 - hammer curl, plan id 3 - preacher curls
// TODO/db note: need multiple workout plans in workout_plans for each user with differnt plan ids so that q_value tables action(plan_id) column can have multiple actions to choose from


// TODO(? likely done): implement a method to query the Q-values for the current state and choose the workout plan with the best score. ->
// example: async function getQValuesForState(userId, state) {
//    const sql = `
//    SELECT action, q_value
//    FROM q_values
//    WHERE user_id = ? AND state = ?;
//`;
//return await db.all(sql, [userId, state]);
//}
// async function recommendBestPlan(userId, state) {
//    const qValues = await getQValuesForState(userId, state);
//    if (qValues.length === 0) {
//        throw new Error('No Q-values found for the current state.');
//    }

    // Find the action with the maximum Q-value
//    let bestAction = qValues[0]; // Assume first is the best initially
//    for (const qValue of qValues) {
//        if (qValue.q_value > bestAction.q_value) {
//            bestAction = qValue;
//        }
//    }
//    return bestAction.action; // Return the action (plan ID) with the highest Q-value
//}
// const recommendedPlanId = await recommendBestPlan(userId, nextState);




// TODO: check all sql queries in sqlitestudio

// to add more workouts to a plan ->
// INSERT INTO workouts (workout_id, plan_id, exercise_name, intensity, duration)
// VALUES 
// (9, 4, 'Squats', 'High', 60),
// (10, 4, 'Bench Press', 'High', 60); ->
// This would add two more workouts to plan_id = 4, and the next time the workout plan is generated, it will include all three exercises: "Deadlift," "Squats," and "Bench Press."


// added workout id 11, 12 in workouts (delete?)

// db notes for current db
// workout_id need to match in exercises and workouts tables (values need to be present and the same in both tables) (i think this is necessary, needs more checking)

// db notes (may not apply as i have changed the db some)
// similar exercises should have the same workout_id in the exercises table ie legs should all have workout_id 2
// match types and intensities in the workouts table with the correct corresponding workout_id value in exercises table ie bench press workout_id values in exercises should be correlated to type strength in the workouts table
// exercise_id's can / must be different as they are different exercises
// need injuries table, might just need injuries column in user_preferences instead
