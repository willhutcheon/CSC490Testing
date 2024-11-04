"use strict";

const express = require("express");
const app = express();
const multer = require("multer");
app.use(multer().none());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const model = require("../models/model");

async function getAllUsers(req, res, next) {
    try {
        let users = await model.getAllUsers();
        // res.render("users-all", { users: users, title: 'All Users', user: req.user });
        res.json({ status: "success", users: users });
    } catch (error) {
        next(error);
    }
}
//req = request 
//res = ?
//next = ?

async function getAllMuscles(req,res,next){
    try {
        let muscle = await model.getAllMuscles();
        // res.render("muscles-all", { muscle: muscle, title: 'All Muscles', muscles: req.muscles });
        res.json({ status: "success", muscles: muscle });
    } catch (error) {
        next(error);
    }
}


// Reinforcement Learning for recommending workout plans
/* async function getRecommendedPlans(req, res, next) {
    try {
        const userId = parseInt(req.query.user_id, 10);
        if (isNaN(userId)) {
            throw new Error('Invalid User ID');
        }
        const userPreferences = await model.getUserPreferences(userId);
        if (!userPreferences) {
            throw new Error('No preferences found for user.');
        }
        const workoutPlans = await model.getWorkoutPlans(userId);
        if (!workoutPlans || workoutPlans.length === 0) {
            throw new Error('No workout plans available.');
        }

        const recommendedPlan = await model.recommendWorkoutPlansWithRL(userPreferences, workoutPlans, userId);
        res.render("recommended-plans", {
            plans: [recommendedPlan],
            title: 'Recommended Workout Plans',
            user: { user_id: userId }
        });
    } catch (error) {
        next(error);
    }
} */

// ADDED, above works
async function getRecommendedPlans(req, res, next) {
    try {
        const userId = parseInt(req.query.user_id, 10);
        if (isNaN(userId)) {
            return res.status(400).send('Invalid User ID');
        }

        const userPreferences = await model.getUserPreferences(userId);
        if (!userPreferences) {
            return res.status(404).send('No preferences found for user.');
        }

        const workoutPlans = await model.getWorkoutPlans(userId);
        if (!workoutPlans || workoutPlans.length === 0) {
            return res.status(404).send('No workout plans available.');
        }

        const recommendedPlan = await model.recommendWorkoutPlansWithRL(userPreferences, workoutPlans, userId);
        /* res.render("recommendations", {
            title: 'Recommended Workout Plans',
            plans: [recommendedPlan],
            user: { user_id: userId }
        }); */
        res.json({
            status: "success",
            recommendedPlans: [recommendedPlan]
        });
        //New JSON code from here
        const workout = await model.workoutExercises();
         //res.json(workout);
        // uncomment above to check but you will have to comment the other res.json out
        //If its not a simple fix lmk and ill change
    } catch (error) {
        next(error);
    }
}


// ADDED
/* async function getRecommendedPlans(req, res) {
    const userId = req.query.user_id;  // Fetching user_id from the query

    // Parse userId to an integer and check if it's valid
    const parsedUserId = parseInt(userId, 10);

    console.log("Parsed User ID:", parsedUserId, "Type:", typeof parsedUserId);

    if (isNaN(parsedUserId)) {
        return res.status(400).send('Invalid User ID');
    }

    try {
        const plans = await model.getUserWorkoutPlans(parsedUserId);  // Pass the parsed userId

        // Structure the data to have workouts grouped by plan
        const structuredPlans = plans.reduce((acc, plan) => {
            const { plan_id, start_date, end_date, active, workout_id, exercise_name, intensity, duration } = plan;

            let planData = acc.find(p => p.plan_id === plan_id);
            if (!planData) {
                planData = {
                    plan_id,
                    start_date,
                    end_date,
                    active,
                    workouts: []
                };
                acc.push(planData);
            }

            if (workout_id) {
                planData.workouts.push({
                    workout_id,
                    exercise_name,
                    intensity,
                    duration
                });
            }

            return acc;
        }, []);

        res.render('recommendations', { title: 'Workout Recommendations', plans: structuredPlans });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).send('Internal Server Error');
    }
} */

/* async function submitPlanFeedback(req, res, next) {
    try {
        const { userId, planId, rating, totalCaloriesBurned } = req.body;
        await model.storeUserPlanFeedback(userId, planId, rating, totalCaloriesBurned);
        res.send({ success: true });
    } catch (error) {
        next(error);
    }
} */

// ADDED, above works
/* async function submitPlanFeedback(req, res, next) {
    try {
        const { userId, planId, rating, totalCaloriesBurned } = req.body;

        // Store the feedback in the database
        await model.storeUserPlanFeedback(userId, planId, rating, totalCaloriesBurned);

        // Calculate reward based on feedback
        const feedback = { rating, totalCaloriesBurned };
        const reward = model.calculateReward(feedback);

        // Update Q-value with feedback
        const state = await model.getUserPreferences(userId); // Assume state is based on user preferences
        model.updateQValue(state, planId, reward, state);

        res.send({ success: true });
    } catch (error) {
        next(error);
    }
} */

// ADDED, above works
async function submitPlanFeedback(req, res) {
    try {
        const { userId, planId, rating, totalCaloriesBurned } = req.body;
        console.log(`Received feedback - User ID: ${userId}, Plan ID: ${planId}, Rating: ${rating}, Calories Burned: ${totalCaloriesBurned}`);

        await model.storeUserPlanFeedback(userId, planId, rating, totalCaloriesBurned);

        if (!userId || !planId || !rating) {
            return res.status(400).send('Missing required parameters: userId, planId, or feedback');
        }

        // Convert planId to a number
        const action = Number(planId);
        if (isNaN(action)) {
            console.error(`Invalid planId (action): ${planId}`);
            throw new Error('Invalid Action: planId is not a valid number');
        }

        // Fetch user's current state from the database (preferences or history)
        const state = await model.getUserPreferences(userId); // Use getUserPreferences to fetch user state
        if (!state || typeof state !== 'object') { // Check if state is valid
            console.error(`Invalid state for user ${userId}: ${state}`);
            throw new Error('Invalid State');
        }

        // Construct state string (may need to adjust how the state is represented)
        const stateString = `${state.fit_goal}${state.exp_level}`;

        // Based on feedback, determine the next state (logic may need adjusting)
        const nextState = determineNextState(stateString, { rating, totalCaloriesBurned });
        if (!nextState || typeof nextState !== 'string') {
            console.error(`Invalid next state derived from feedback: ${feedback}`);
            throw new Error('Invalid Next State');
        }

        // Ensure reward is a valid number
        const reward = model.calculateReward({ rating, totalCaloriesBurned });

        // Update Q-value based on feedback and reward
        await model.updateQValue(userId, stateString, action, reward, nextState);

        // Respond with success
        res.status(200).send({ message: 'Feedback submitted successfully!' });
    } catch (error) {
        console.error(`Error in submitPlanFeedback: ${error.message}`, {
            body: req.body,
            errorStack: error.stack
        });
        res.status(500).send({ error: 'Error submitting feedback.' });
    }
}

function determineNextState(currentState, feedback) {
    // Need to implement logic for determining the next state based on current state and feedback
    // using a simple concatenation currently as an example
    return currentState + feedback.rating; // This logic will likely need to be adjusted
}

//here the user is undefined
async function getUser(req, res, next) {
    const user_id =req.params.user_id.replace ( /[^\d.]/g, '' );//replaces user_id= so we just get the id
    try {
        const user = await model.getUser(user_id);
        if (user) {
            // res.render('user-profile', { user, user_id: user.user_id, error: null, message: null });
            res.json({ status: "success", user: user });
        } else {
            //errstring  += user_id;
            res.status(404).send({ error: "User not found"});
        } 
    } catch (err) {
        console.error("Error fetching user:", err.message);
        res.status(500).send({ error: "Failed to fetch user data -C" });
        next(err);
    }
}


module.exports = {
    getAllUsers,
    getRecommendedPlans,
    submitPlanFeedback,
    determineNextState,
    getAllMuscles,
    getUser
};
