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
        res.json({ status: "success", users: users });
    } catch (error) {
        next(error);
    }
}

async function getAllMuscles(req,res,next){
    try {
        let muscle = await model.getAllMuscles();
        res.json({ status: "success", muscles: muscle });
    } catch (error) {
        next(error);
    }
}

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
        res.json({
            status: "success",
            recommendedPlans: [recommendedPlan]
        });
    } catch (error) {
        next(error);
    }
}

async function getLogin(req,res){
    try {
        const { username, password } = req.body;
        const results = await model.getLogin(username);
    } catch (error) {
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
    const user_id =req.params.user_id.replace ( /[^\d.]/g, '' ); //replaces user_id= so we just get the id
    try {
        const user = await model.getUser(user_id);
        if (user) {
            res.json({ status: "success", user: user });
        } else {
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
        if (!userId || !planId || !rating) {
            return res.status(400).send('Missing required parameters: userId, planId, or feedback');
        }
        await model.storeUserPlanFeedback(userId, planId, rating, totalCaloriesBurned);
        // Fetch user's current state from the database (preferences or history)
        const state = await model.getUserPreferences(userId);
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
        const feedback = await model.getUserPlanFeedback(userId, planId);
        const reward = model.calculateReward(feedback);
        console.log(`Reward in submitPlanFeedback: ${reward}`);
        // Update Q-value based on feedback and reward
        await model.updateQValue(userId, state.fit_goal + state.exp_level, Number(planId), reward, nextState);
        const epsilonMin = 0.01;
        const epsilonDecay = 0.995;
        let epsilon = await model.getEpsilon(userId); // Fetch current epsilon
        if (epsilon === null) {
            epsilon = 1.0; // Default initial value
            await model.updateEpsilon(userId, epsilon); // Initialize epsilon in the database
        }
        const newEpsilon = Math.max(epsilonMin, epsilon * epsilonDecay);
        await model.updateEpsilon(userId, newEpsilon); // Update epsilon in the database
        console.log(`Updated epsilon for user ${userId}: ${newEpsilon}`);
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
    getUserHistory
};
// Different plan, same state: Chosen when feedback is positive or performance doesn’t warrant a state change.
// New state: Triggered by low feedback or high performance, suggesting either a new workout type (e.g., cardio) or a new level (e.g., intermediate).