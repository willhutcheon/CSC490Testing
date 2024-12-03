"use strict";

const express = require("express");
const app = express();
const multer = require("multer");
app.use(multer().none());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const model = require("../models/crudmodel");

/**
 * Creates a new user in the database using the data provided in the request body.
 * Validates the required fields, ensures user_id is a number, and creates the user if valid.
 * If successful, returns a success message, otherwise returns an error.
 * 
 * @param {Object} req - The request object containing the user data in the request body.
 * @param {Object} res - The response object used to send back the success or error message.
 * @param {Function} next - The next middleware function to pass the error to if any occurs.
 */
async function createUser(req, res, next) {
    // Destructure the user data from the request body
    let { user_id, fname, lname, username, password, email, fit_goal, exp_level } = req.body;
    // Convert user_id to an integer
    user_id = parseInt(user_id, 10);
    // Log the received parameters for debugging purposes
    console.log("Received parameters:", { user_id, fname, lname, username, password, email, fit_goal, exp_level });
    // Validate if user_id is a number
    if (isNaN(user_id)) {
        console.error("user_id is not a number:", req.body.user_id);
        return res.status(400).send({ error: "User ID must be a number" });
    }
    // Check if all required fields are provided
    if (user_id && fname && lname && username && password && email && fit_goal && exp_level) {
        // Prepare the parameters for insertion into the database
        let params = [user_id, fname, lname, username, password, email, fit_goal, exp_level, new Date().toISOString()];
        // Log the parameters for the database insertion
        console.log("Params for DB:", params);
        try {
            // Call the model function to create the user in the database
            await model.createUser(params);
            // If successful, send a success message back to the client
            res.status(201).send({ message: "User created successfully" });
        } catch (err) {
            // Log the error if there was an issue with the database operation
            console.error("Error while creating a new user, talk to Will", err.message);
            // Respond with an error message
            res.status(500).send({ error: "Failed to create user" });
            // Pass the error to the next middleware for further handling
            next(err);
        }
    } else {
        // If required fields are missing, send an error message
        res.status(400).send({ error: "Missing required fields" });
    }
}

/**
 * Creates a new user preferences entry in the database using the data provided in the request body.
 * Validates the required fields, ensures user_id is a number, and creates the preferences if valid.
 * If successful, returns a success message; otherwise, returns an error.
 * 
 * @param {Object} req - The request object containing the user preferences data in the request body.
 * @param {Object} res - The response object used to send back the success or error message.
 * @param {Function} next - The next middleware function to pass the error to if any occurs.
 */
async function createPreferences(req, res, next) {
    // Destructure the user preferences data from the request body
    let { preference_id, user_id, preferred_types, preferred_intensity, preferred_duration, preferred_exercise } = req.body;
    // Convert user_id to an integer
    user_id = parseInt(user_id, 10);
    // Validate if user_id is a number
    if (isNaN(user_id)) {
        console.error("user_id is not a number:", req.body.user_id);
        // Return a 400 status with an error message if user_id is invalid
        return res.status(400).send({ error: "User ID must be a number" });
    }
    // Check if all required fields are provided
    if (preference_id && user_id && preferred_types && preferred_intensity && preferred_duration && preferred_exercise) {
        // Prepare the parameters for inserting the preferences into the database
        let params = [preference_id, user_id, preferred_types, preferred_intensity, preferred_duration, preferred_exercise];
        try {
            // Call the model function to create the preferences in the database
            await model.createPreferences(params);
            // If successful, send a success message back to the client
            res.status(201).send({ message: "User preferences created successfully" });
        } catch (err) {
            // Log the error if there was an issue with the database operation
            console.error("Error while creating a new user preferences, talk to Will", err.message);
            // Respond with an error message and 500 status if creation fails
            res.status(500).send({ error: "Failed to create user preferences" });
            // Pass the error to the next middleware for further handling
            next(err);
        }
    } else {
        // If any required field is missing, send a 400 error with a message indicating missing fields
        res.status(400).send({ error: "Missing required fields" });
    }
}

/**
 * Updates an existing user's account information in the database.
 * Validates the required fields, ensures the user_id is a number, and updates the user details if valid.
 * If successful, returns a success message; otherwise, returns an error.
 * 
 * @param {Object} req - The request object containing the new user data in the request body.
 * @param {Object} res - The response object used to send back the success or error message.
 * @param {Function} next - The next middleware function to pass the error to if any occurs.
 */
async function updateUser(req, res, next) {
    // Destructure the new user data from the request body
    let { user_id, fname, lname, username, password, email, fit_goal, exp_level } = req.body;
    // Convert user_id to an integer
    user_id = parseInt(user_id, 10);
    // Validate if user_id is a number
    if (isNaN(user_id)) {
        console.error("user_id is not a number:", req.body.user_id);
        // Return a 400 status with an error message if user_id is invalid
        return res.status(400).send({ error: "User ID must be a number" });
    }
    // Check if all required fields are provided
    if (fname && lname && username && password && email && fit_goal && exp_level) {
        // Prepare the parameters for updating the user information in the database
        let params = [fname, lname, username, password, email, fit_goal, exp_level, user_id];
        try {
            // Call the model function to update the user in the database
            await model.updateUser(params);
            // If successful, send a success message back to the client
            res.status(200).send({ message: "User updated successfully" });
        } catch (err) {
            // Log the error if there was an issue with the database operation
            console.error("Error while updating user account, talk to Will", err.message);
            // Respond with an error message and 500 status if update fails
            res.status(500).send({ error: "Failed to update user" });
            // Pass the error to the next middleware for further handling
            next(err);
        }
    } else {
        // If any required field is missing, send a 400 error with a message indicating missing fields
        res.status(400).send({ error: "Missing required fields" });
    }
}

/**
 * Updates the preferences of an existing user in the database.
 * Validates the required fields, ensures the user_id is a number, and updates the preferences if valid.
 * If successful, returns a success message; otherwise, returns an error.
 * 
 * @param {Object} req - The request object containing the new user preferences data in the request body.
 * @param {Object} res - The response object used to send back the success or error message.
 * @param {Function} next - The next middleware function to pass the error to if any occurs.
 */
async function updatePreferences(req, res, next) {
    // Destructure the new user preferences data from the request body
    let { user_id, preferred_types, preferred_intensity, preferred_duration, preferred_exercise } = req.body;
    // Convert user_id to an integer
    user_id = parseInt(user_id, 10);
    // Validate if user_id is a number
    if (isNaN(user_id)) {
        console.error("user_id is not a number:", req.body.user_id);
        // Return a 400 status with an error message if user_id is invalid
        return res.status(400).send({ error: "User ID must be a number" });
    }
    // Check if all required fields are provided
    if (preferred_types && preferred_intensity && preferred_duration && preferred_exercise) {
        // Prepare the parameters for updating the user preferences in the database
        let params = [preferred_types, preferred_intensity, preferred_duration, preferred_exercise, user_id];
        try {
            // Call the model function to update the user preferences in the database
            await model.updatePreferences(params);
            // If successful, send a success message back to the client
            res.status(200).send({ message: "User preferences updated successfully" });
        } catch (err) {
            // Log the error if there was an issue with the database operation
            console.error("Error while updating user preferences:", err.message);
            // Respond with an error message and 500 status if update fails
            res.status(500).send({ error: "Failed to update user preferences" });
            // Pass the error to the next middleware for further handling
            next(err);
        }
    } else {
        // If any required field is missing, send a 400 error with a message indicating missing fields
        res.status(400).send({ error: "Missing required fields" });
    }
}

/**
 * Retrieves user data from the database based on the provided user ID.
 * If the user exists, it returns the user data with a 200 status; otherwise, it returns a 404 error.
 * In case of an error, it returns a 500 error with a message.
 * 
 * @param {Object} req - The request object containing the user_id in the URL parameters.
 * @param {Object} res - The response object used to send the success or error response.
 * @param {Function} next - The next middleware function to pass any errors that occur.
 */
async function getUser(req, res, next) {
    // Extract user_id from the URL parameters
    const user_id = req.params.user_id;
    try {
        // Call the model function to fetch user data based on the user_id
        const user = await model.getUser(user_id);
        // Check if the user was found in the database
        if (user) {
            // If user is found, return the user data in the response with a 200 status
            res.status(200).json({ user });
        } else {
            // If user is not found, return a 404 error with a message
            res.status(404).send({ error: "User not found"});
        } 
    } catch (err) {
        // Log any errors that occur while fetching the user
        console.error("Error fetching user:", err.message);
        // Respond with a 500 error if something goes wrong with the database query
        res.status(500).send({ error: "Failed to fetch user data" });
        // Pass the error to the next middleware for further handling
        next(err);
    }
}

/**
 * Retrieves both user data and their preferences from the database based on the provided user ID.
 * If both the user and preferences are found, it returns them with a 200 status; otherwise, it returns a 404 error.
 * In case of an error, it returns a 500 error with a message.
 * 
 * @param {Object} req - The request object containing the user_id in the URL parameters.
 * @param {Object} res - The response object used to send the success or error response.
 * @param {Function} next - The next middleware function to pass any errors that occur.
 */
async function getPreferences(req, res, next) {
    // Extract user_id from the URL parameters
    const user_id = req.params.user_id;
    try {
        // Fetch the user data from the database using the user_id
        const user = await model.getUser(user_id);
        // Fetch the user preferences from the database using the user_id
        const preferences = await model.getPreferences(user_id);
        // Check if both the user and preferences are found in the database
        if (user && preferences) {
            // If both user and preferences are found, send them in the response with a 200 status
            res.status(200).json({ user, preferences });
        } else {
            // If either the user or preferences are not found, send a 404 error with a message
            res.status(404).send({ error: "User or preferences not found" });
        }
    } catch (err) {
        // Log any errors that occur while fetching the user or preferences
        console.error("Error fetching user or preferences:", err.message);
        // Respond with a 500 error if something goes wrong with the database queries
        res.status(500).send({ error: "Failed to fetch user or preferences data" });
        // Pass the error to the next middleware for further handling
        next(err);
    }
}

/**
 * Logs a new injury for a user based on the provided muscle_id, user_id, and injury_intensity.
 * If the user_id is not valid, it sends a 400 status with an error message.
 * If any required fields are missing, it sends a 400 status with an error message.
 * If an error occurs during the database operation, it sends a 500 status with an error message.
 * 
 * @param {Object} req - The request object containing the data (muscle_id, user_id, injury_intensity) in the request body.
 * @param {Object} res - The response object used to send the success or error response.
 * @param {Function} next - The next middleware function to pass any errors that occur.
 */
async function createInjury(req, res, next) {
    // Extract muscle_id, user_id, and injury_intensity from the request body
    let { muscle_id, user_id, injury_intensity} = req.body;
    user_id = parseInt(user_id, 10);
    // Log the received parameters for debugging
    console.log("Received parameters:", { muscle_id, user_id, injury_intensity });
    // Check if user_id is a valid number
    if (isNaN(user_id)) {
        console.error("user_id is not a number:", req.body.user_id);
        return res.status(400).send({ error: "User ID must be a number" });
    }
    // Check if all required fields are provided
    if (muscle_id, user_id, injury_intensity) {
        // Prepare parameters for database insertion
        let params = [muscle_id, user_id, injury_intensity];
        console.log("Params for DB:", params);
        try {
            // Call the model function to log the injury in the database
            await model.createInjury(params);
            // If the injury is logged successfully, send a 201 status with a success message
            res.status(201).send({ message: "Injury logged successfully" });
        } catch (err) {
            // If an error occurs while logging the injury, log the error and send a 500 status with an error message
            console.error("Error while logging injury, talk to Brandon", err.message);
            res.status(500).send({ error: "Failed to log injury" });
            // Pass the error to the next middleware for further handling
            next(err);
        }
    } else {
        // If any required fields are missing, send a 400 status with an error message
        res.status(400).send({ error: "Missing required fields" });
    }
}

/**
 * Creates a new workout performance entry for a user based on the provided parameters such as perf_id, exercise_id, 
 * actual sets, reps, weight, and performance date.
 * If the perf_id is not a valid number, it sends a 400 status with an error message.
 * If any required fields are missing, it sends a 400 status with an error message.
 * If an error occurs during the database operation, it sends a 500 status with an error message.
 * 
 * @param {Object} req - The request object containing the data (perf_id, exercise_id, actual_sets, actual_reps, actual_weight, perf_date) in the request body.
 * @param {Object} res - The response object used to send the success or error response.
 * @param {Function} next - The next middleware function to pass any errors that occur.
 */
async function createWorkoutPerformance(req, res, next) {
    // Extract the performance-related data from the request body
    let { perf_id, exercise_id, actual_sets, actual_reps, actual_weight, perf_date } = req.body;
    // Convert perf_id to an integer
    perf_id = parseInt(perf_id, 10);
    // Log the received parameters for debugging purposes
    console.log("Received parameters:", { perf_id, exercise_id, actual_sets, actual_reps, actual_weight, perf_date });
    // Check if perf_id is a valid number
    if (isNaN(perf_id)) {
        console.error("perf_id is not a number:", req.body.perf_id);
        return res.status(400).send({ error: "Perf ID must be a number" });
    }
    // Check if all required fields are provided
    if (perf_id && exercise_id && actual_sets && actual_reps && actual_weight && perf_date) {
        // Prepare the parameters for the database query
        let params = [perf_id, exercise_id, actual_sets, actual_reps, actual_weight, perf_date];
        console.log("Params for DB:", params);
        try {
            // Attempt to create the new workout performance entry in the database
            await model.createWorkoutPerformance(params);
            // If successful, send a 201 status with a success message
            res.status(201).send({ message: "Workout Performance created successfully" });
        } catch (err) {
            // Log any errors that occur during the database operation
            console.error("Error while creating a entry, check with Brandon", err.message);
            // Respond with a 500 status indicating failure to create the entry
            res.status(500).send({ error: "Failed to create Workout Performance" });
            // Pass the error to the next middleware for further handling
            next(err);
        }
    } else {
        // If any required fields are missing, send a 400 status with an error message
        res.status(400).send({ error: "Missing required fields" });
    }
}

/**
 * Updates an existing workout performance entry for a user based on the provided parameters such as perf_id, exercise_id, 
 * actual sets, reps, weight, and performance date.
 * If the perf_id is not a valid number, it sends a 400 status with an error message.
 * If any required fields are missing, it sends a 400 status with an error message.
 * If an error occurs during the database operation, it sends a 500 status with an error message.
 * 
 * @param {Object} req - The request object containing the data (perf_id, exercise_id, actual_sets, actual_reps, actual_weight, perf_date) in the request body.
 * @param {Object} res - The response object used to send the success or error response.
 * @param {Function} next - The next middleware function to pass any errors that occur.
 */
async function updateWorkoutPerformance(req, res, next) {
    // Extract the performance-related data from the request body
    let { perf_id, exercise_id, actual_sets, actual_reps, actual_weight, perf_date } = req.body;
    // Convert perf_id to an integer
    perf_id = parseInt(perf_id, 10);
    // Log the received parameters for debugging purposes
    console.log("Received parameters:", { perf_id, exercise_id, actual_sets, actual_reps, actual_weight, perf_date });
    // Check if perf_id is a valid number
    if (isNaN(perf_id)) {
        console.error("perf_id is not a number:", req.body.perf_id);
        return res.status(400).send({ error: "Perf ID must be a number" });
    }
    // Check if all required fields are provided
    if (perf_id && exercise_id && actual_sets && actual_reps && actual_weight && perf_date) {
        // Prepare the parameters for the database query
        let params = [perf_id, exercise_id, actual_sets, actual_reps, actual_weight, perf_date];
        console.log("Params for DB:", params);
        try {
            // Attempt to update the existing workout performance entry in the database
            await model.updateWorkoutPerformance(params);
            // If successful, send a 201 status with a success message
            res.status(201).send({ message: "Workout Performance updated successfully" });
        } catch (err) {
            // Log any errors that occur during the database operation
            console.error("Error while updating an entry, check with Brandon", err.message);
            // Respond with a 500 status indicating failure to update the entry
            res.status(500).send({ error: "Failed to update Workout Performance" });
            // Pass the error to the next middleware for further handling
            next(err);
        }
    } else {
        // If any required fields are missing, send a 400 status with an error message
        res.status(400).send({ error: "Missing required fields" });
    }
}

/**
 * Fetches the workout performance data for a user based on the provided user_id in the request parameters.
 * If the performance data is found, it sends a 200 status with the data.
 * If no data is found, it sends a 404 status with an error message.
 * If an error occurs during the database operation, it sends a 500 status with an error message.
 * 
 * @param {Object} req - The request object containing the user_id parameter in the URL.
 * @param {Object} res - The response object used to send the success or error response.
 */
async function getWorkoutPerformance(req, res) {
    // Extract the user_id from the request parameters
    const user_id = req.params.user_id;
    try {
        // Attempt to retrieve the workout performance data from the model based on the user_id
        const perf = await model.getWorkoutPerformance(user_id);
        // If data is found, send a 200 status with the performance data
        if (perf) {
            // If no data is found, send a 404 status with an error message
            res.status(200).json({ perf });
        } else {
            res.status(404).send({ error: "Data not found"});
        } 
    } catch (err) {
        // If there is an error during the database operation, log the error and send a 500 status
        console.error("Error fetching data:", err.message);
        res.status(500).send({ error: "Failed to fetch data" });
        
    }
}

module.exports = {
    createUser,
    updateUser,
    getUser,
    updatePreferences,
    getPreferences,
    createPreferences,
    createInjury,
    createWorkoutPerformance,
    updateWorkoutPerformance,
    getWorkoutPerformance
}