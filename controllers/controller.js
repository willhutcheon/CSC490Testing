"use strict";

const express = require("express");
const app = express();
const multer = require("multer");
app.use(multer().none());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const model = require("../models/model");

/**
 * Handles a request to retrieve all users from the database and returns them as a JSON response.
 * 
 * @param {Object} req - The request object from the Express framework.
 * @param {Object} res - The response object used to send data back to the client.
 * @param {Function} next - The next middleware function in the request-response cycle.
 */
async function getAllUsers(req, res, next) {
    try {
        // Call the model function to fetch all users from the database.
        let users = await model.getAllUsers();
        // Send a JSON response with the retrieved users and a status of success.
        res.json({ status: "success", users: users });
    } catch (error) {
        // If an error occurs, pass it to the next middleware (typically an error handler).
        next(error);
    }
}

/**
 * Handles a request to retrieve all muscle groups from the database and returns them as a JSON response.
 *
 * @param {Object} req - The request object from the Express framework.
 * @param {Object} res - The response object used to send data back to the client.
 * @param {Function} next - The next middleware function in the request-response cycle.
 */
async function getAllMuscles(req,res,next){
    try {
        // Call the model function to fetch all muscle groups from the database.
        let muscle = await model.getAllMuscles();
        // Send a JSON response with the retrieved muscle groups and a status of success.
        res.json({ status: "success", muscles: muscle });
    } catch (error) {
        // If an error occurs, pass it to the next middleware (typically an error handler).
        next(error);
    }
}

/**
 * Handles a request to retrieve recommended workout plans for a user based on their preferences and available plans.
 * 
 * The function checks for a valid user ID, fetches the user's preferences, retrieves available workout plans, 
 * and recommends a workout plan using reinforcement learning.
 *
 * @param {Object} req - The request object from the Express framework, containing query parameters.
 * @param {Object} res - The response object used to send data back to the client.
 * @param {Function} next - The next middleware function in the request-response cycle, used to handle errors.
 */
async function getRecommendedPlans(req, res, next) {
    try {
        // Parse the user_id from the query string and ensure it's a valid number.
        const userId = parseInt(req.query.user_id, 10);
        if (isNaN(userId)) {
            // If the user_id is invalid, send a 400 status with an error message.
            return res.status(400).send('Invalid User ID');
        }
        // Fetch the user's preferences from the model.
        const userPreferences = await model.getUserPreferences(userId);
        if (!userPreferences) {
            // If no preferences are found, send a 404 status with an error message.
            return res.status(404).send('No preferences found for user.');
        }
        // Fetch the available workout plans for the user from the model.
        const workoutPlans = await model.getWorkoutPlans(userId);
        if (!workoutPlans || workoutPlans.length === 0) {
            // If no workout plans are found, send a 404 status with an error message.
            return res.status(404).send('No workout plans available.');
        }
        // Use reinforcement learning to recommend a workout plan based on the user's preferences and available plans.
        const recommendedPlan = await model.recommendWorkoutPlansWithRL(userPreferences, workoutPlans, userId);
        // Send a JSON response containing the recommended workout plans.
        res.json({
            status: "success",
            // Wrap the recommended plan in an array.
            recommendedPlans: [recommendedPlan]
        });
    } catch (error) {
        // If an error occurs during any of the above operations, pass it to the next middleware (error handler).
        next(error);
    }
}

/**
 * Handles a login request by verifying the user's credentials (username and password).
 * 
 * The function retrieves user data based on the provided username, checks if the password matches the stored password,
 * and sends an appropriate response indicating success or failure.
 *
 * @param {Object} req - The request object containing the username and password in the body.
 * @param {Object} res - The response object used to send data back to the client.
 */
async function getLogin(req, res) {
    console.log("Request Body:", req.body); // Debug log

    const { username, password } = req.body;

    // Check if both username and password are present
    if (!username || !password) {
        return res.status(400).send({ success: false, message: "Username or password missing" });
    }

    try {
        // Call model.getLogin with the username
        const user = await model.getLogin(username); // Directly get the user object
        console.log("Fetched User:", user); // Debug log to confirm the user is fetched

        if (!user) {
            return res.status(400).send({ success: false, message: "Invalid username or password" });
        }

        if (password === user.password) {
            return res.status(200).send({
                success: true,
                userId: user.id,
                message: "Login successful",
            });
        } else {
            return res.status(400).send({ success: false, message: "Invalid username or password" });
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send({ error: "Failed to process login" });
    }
}


/**
 * Handles a request to retrieve user data based on the provided user_id.
 * 
 * The function sanitizes the user_id from the request parameters, queries the database for the user, and sends
 * a response with the user data or an error message if the user is not found.
 *
 * @param {Object} req - The request object, containing the user_id as a route parameter.
 * @param {Object} res - The response object, used to send back the result.
 * @param {Function} next - The next middleware function in case of an error.
 */
async function getUser(req, res, next) {
    // Sanitize the user_id by removing any non-numeric characters, leaving only the digits.
    const user_id =req.params.user_id.replace ( /[^\d.]/g, '' ); //replaces user_id= so we just get the id
    try {
        // Query the database to fetch the user based on the sanitized user_id.
        const user = await model.getUser(user_id);
        // If the user exists, return the user data in JSON format with a success status.
        if (user) {
            res.json({ status: "success", user: user });
        } else {
            // If the user is not found, return a 404 status with an error message.
            res.status(404).send({ error: "User not found"});
        } 
    } catch (err) {
        // Log the error message to the console for debugging purposes.
        console.error("Error fetching user:", err.message);
        // If there is an error while fetching the user, return a 500 status with an error message.
        res.status(500).send({ error: "Failed to fetch user data -C" });
        // Pass the error to the next middleware for further handling.
        next(err);
    }
}

/**
 * Handles the submission of feedback for a workout plan. 
 * It processes the feedback, updates the Q-values based on the feedback and user preferences, 
 * and adjusts the exploration rate (epsilon) for reinforcement learning.
 * 
 * @param {Object} req - The request object, containing user feedback data (userId, planId, rating, totalCaloriesBurned).
 * @param {Object} res - The response object, used to send a success or error message back to the client.
 */
async function submitPlanFeedback(req, res) {
    console.log("submitPlanFeedback called");
    console.log("Form submission data:", req.body);
    try {
        // Extract feedback data from the request body.
        const { userId, planId, rating, totalCaloriesBurned } = req.body;
        console.log(`Received feedback - User ID: ${userId}, Plan ID: ${planId}, Rating: ${rating}, Calories Burned: ${totalCaloriesBurned}`);
        // Validate that all required parameters (userId, planId, rating) are provided.
        if (!userId || !planId || !rating) {
            return res.status(400).send('Missing required parameters: userId, planId, or feedback');
        }
        // Store the feedback data in the database.
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
        // Validate that the next state is a valid string.
        if (!nextState || typeof nextState !== 'string') {
            console.error(`Invalid next state derived from feedback: ${nextState}`);
            throw new Error('Invalid Next State');
        }
        // Retrieve the feedback for the workout plan to calculate the reward.
        const feedback = await model.getUserPlanFeedback(userId, planId);
        const reward = model.calculateReward(feedback);
        console.log(`Reward in submitPlanFeedback: ${reward}`);
        // Update Q-value based on feedback and reward
        await model.updateQValue(userId, state.fit_goal + state.exp_level, Number(planId), reward, nextState);
        // Constants for epsilon decay
        // Minimum value for epsilon (exploration rate).
        const epsilonMin = 0.01;
        // Decay factor for epsilon to reduce exploration over time.
        const epsilonDecay = 0.995;
        // Fetch the current epsilon value for the user (exploration rate).
        let epsilon = await model.getEpsilon(userId); // Fetch current epsilon
        if (epsilon === null) {
            epsilon = 1.0; // Default initial value
            await model.updateEpsilon(userId, epsilon); // Initialize epsilon in the database
        }
        // Apply the decay factor to update the epsilon value.
        const newEpsilon = Math.max(epsilonMin, epsilon * epsilonDecay);
        // Update the epsilon value in the database for the user.
        await model.updateEpsilon(userId, newEpsilon);
        console.log(`Updated epsilon for user ${userId}: ${newEpsilon}`);
        // Respond with success
        res.status(200).send({ 
            message: 'Feedback submitted successfully!'
            // ADDED
            // currentState: nextState
        });
    } catch (error) {
        // Log the error and send an error response if something goes wrong.
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

/**
 * Retrieves the workout history for a specific user, identified by their user ID.
 * Fetches the user's performance data from the database and returns it in the response.
 * 
 * @param {Object} req - The request object containing the user_id parameter in the URL.
 * @param {Object} res - The response object used to send back the user's performance data.
 * @param {Function} next - The next middleware function to pass the error to if any occurs.
 */
async function getUserHistory(req, res, next) {
    // Sanitize the user_id parameter to only allow digits and dots (remove any non-digit characters).
    const user_id = req.params.user_id.replace(/[^\d.]/g, '');
    try {
        // Fetch the user's workout history or performance data from the database using the sanitized user_id.
        let performance = await model.getUserHistory(user_id);
        // Send the performance data back to the client in JSON format.
        res.json({performance:performance});
    } catch (error) {
        // Pass the error to the next error-handling middleware.
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