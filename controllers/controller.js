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
        
        // KEEP AND USE
        res.json({
            status: "success",
            recommendedPlans: [recommendedPlan]
        });

        //New JSON code from here
        // const workout = await model.workoutExercises();
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


// WORKS
// ADDED, above works
/* async function submitPlanFeedback(req, res) {
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
} */
/* function determineNextState(currentState, feedback) {
    // Need to implement logic for determining the next state based on current state and feedback
    // using a simple concatenation currently as an example
    return currentState + feedback.rating; // This logic will likely need to be adjusted
} */
// WORKS

async function getLogin(req,res){
    try {
        const { username, password } = req.body;
        // res.render("muscles-all", { muscle: muscle, title: 'All Muscles', muscles: req.muscles });

        const results = await model.getLogin(username);
    } catch (error) {
        //console.error("Error fetching user:", err.message);
        res.status(500).send({ error: "Failed to fetch user data" });;
    }
    if (results.length === 0){
        return res.status(400).send({ success: false, message: 'Invalid username or password' });
    }else {
        const user = results[0];
        if (password === user.password){
            return res.status(200).send({success: true, message: "Login successful"})
        }else{
            return res.status(400).send({ success: false, message: 'Invalid username or password' });

        }
        
    }
}

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

async function submitPlanFeedback(req, res) {
    console.log("submitPlanFeedback called");
    console.log("Form submission data:", req.body);
    try {
        const { userId, planId, rating, totalCaloriesBurned } = req.body;
        console.log(`Received feedback - User ID: ${userId}, Plan ID: ${planId}, Rating: ${rating}, Calories Burned: ${totalCaloriesBurned}`);

        // Insert or update user plan feedback in the database
        //await model.storeUserPlanFeedback(userId, planId, rating, totalCaloriesBurned);

        if (!userId || !planId || !rating) {
            return res.status(400).send('Missing required parameters: userId, planId, or feedback');
        }

        await model.storeUserPlanFeedback(userId, planId, rating, totalCaloriesBurned);

        // Fetch user's current state from the database (preferences or history)
        const state = await model.getUserPreferences(userId);

        // console.log(`User state: ${JSON.stringify(state)}`);

        if (!state || typeof state !== 'object') {
            console.error(`Invalid state for user ${userId}: ${state}`);
            throw new Error('Invalid State');
        }

        // Fetch performance metrics from exercises
        const performanceMetrics = await model.getPerformanceMetrics(planId);
        if (!performanceMetrics || performanceMetrics.length === 0) {
            console.error(`No performance metrics found for planId: ${planId}`);
            throw new Error('No Performance Metrics Found');
        }

        // Aggregate metrics
        const totalReps = performanceMetrics.reduce((sum, metric) => sum + metric.plan_reps, 0);
        const totalWeightLifted = performanceMetrics.reduce((sum, metric) => sum + (metric.plan_reps * metric.plan_weight), 0);

        // Pass aggregated metrics to determineNextState
        // NEED TO USE MODEL VERSION OF THIS FUNCTION
        const nextState = determineNextState(state.fit_goal + state.exp_level, rating, { reps: totalReps, weightLifted: totalWeightLifted }, state.userPreferences);


        if (!nextState || typeof nextState !== 'string') {
            console.error(`Invalid next state derived from feedback: ${nextState}`);
            throw new Error('Invalid Next State');
        }

        // Calculate reward
        const reward = model.calculateReward({ rating, totalCaloriesBurned });

        // Update Q-value based on feedback and reward
        await model.updateQValue(userId, state.fit_goal + state.exp_level, Number(planId), reward, nextState);
        // TEST
        //await updateQValue(userId, state, recommendedPlan.plan_id, reward, nextState);

        // Respond with success
        res.status(200).send({ 
            message: 'Feedback submitted successfully!'
            // ADDED
            // currentState: nextState
        });
    } catch (error) {
        console.error(`Error in submitPlanFeedback: ${error.message}`, {
            body: req.body,
            errorStack: error.stack
        });
        res.status(500).send({ error: 'Error submitting feedback.' });
    }
}
// THIS IS ALREADY IN MODEL, USE MODEL VERSION IN submitPlanFeedback
function determineNextState(currentState, feedback, performanceMetrics, userPreferences) {
    

    // NEED THIS EVENTUALLY
    // Check for manual preference adjustments from userPreferences
    /* if (userPreferences.updated) {
        // If the user manually updated their preferences, change the state accordingly
        nextState = `${userPreferences.goal}${userPreferences.level}`;
    } */


    console.log(`Test Current State viewing: ${currentState}`);
    console.log(`Performance Metrics in determineNextState viewing: ${JSON.stringify(performanceMetrics)}`);
    console.log(`Current State viewing: ${currentState}`);
    console.log(`Feedback viewing: ${JSON.stringify(feedback)}`);


    // Define thresholds for feedback and performance
    const feedbackThreshold = 3; // Threshold for low ratings triggering a state change
    const performanceThreshold = 5; // Threshold for performance improvement triggering state progression

    // Example state mappings based on feedback and performance
    const stateMapping = {
        "StrengthBeginner": "StrengthIntermediate",
        "StrengthIntermediate": "StrengthAdvanced",
        "CardioBeginner": "CardioIntermediate",
        "CardioIntermediate": "CardioAdvanced",

        // ADDED
        "StrengthAdvanced": "StrengthBeginner"
    };

    let nextState = currentState;

    // Evaluate user feedback (positive or negative)
    if (feedback.rating < feedbackThreshold) {
        // If feedback is consistently low, consider transitioning to a different workout focus or difficulty level
        if (currentState.includes("Strength")) {
            nextState = "CardioBeginner"; // Transition to cardio if strength is poorly rated
        } else if (currentState.includes("Cardio")) {
            nextState = "StrengthBeginner"; // Transition to strength if cardio is poorly rated
        }
    } else if (feedback.rating >= feedbackThreshold && feedback.rating <= 5) {
        // Check performance metrics for improvement
        if (performanceMetrics.reps > performanceThreshold) {
            // If performance is improving, upgrade the state
            nextState = stateMapping[currentState] || currentState; // Move to the next level if available
        }
    }

    // Further customization based on user preferences can be added here
    // For instance, if user prefers higher intensity, we could adjust the nextState accordingly.

    return nextState;
}



// REMOVE
/* const currentState = "CardioIntermediate";
const feedback = { rating: 4 };
const performanceMetrics = { reps: 10, weightLifted: 0 };
const userPreferences = {}; // You can leave this empty for this test
const nextState = determineNextState(currentState, feedback, performanceMetrics, userPreferences);
console.log(`Test Current State: ${currentState}`);
console.log(`Test Feedback Rating: ${feedback.rating}`);
console.log(`Test Performance Metrics: ${JSON.stringify(performanceMetrics)}`);
console.log(`Test Next State: ${nextState}`); */
// REMOVE



// COLLIN ADDED
async function getUserHistory(req, res, next) {
    const user_id = req.params.user_id.replace(/[^\d.]/g, '');
    try {
        let performance = await model.getUserHistory(user_id);
        res.json({performance:performance});
    } catch (error) {
        next(error);
    }
}


module.exports = {
    getAllUsers,
    getRecommendedPlans,
    submitPlanFeedback,
    determineNextState,
    getAllMuscles,
    getUser,
    getLogin,

    // COLLIN ADDED
    getUserHistory
};
// Different plan, same state: Chosen when feedback is positive or performance doesn’t warrant a state change.
// New state: Triggered by low feedback or high performance, suggesting either a new workout type (e.g., cardio) or a new level (e.g., intermediate).
