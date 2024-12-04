"use strict";
const db = require("../models/db-conn");

/**
 * Inserts a new user record into the `users` table in the database.
 * The function uses the provided parameters to populate the respective fields in the table.
 * 
 * @param {Array} params - An array containing the values to be inserted into the `users` table.
 *                         The expected order is:
 *                         [user_id, fname, lname, username, password, email, fit_goal, exp_level, created_at]
 * @returns {Promise} - A promise that resolves when the SQL query is executed.
 */
async function createUser(params) {
    // SQL query to insert a new user record into the `users` table
    let sql = `
        INSERT INTO users (user_id, fname, lname, username, password, email, fit_goal, exp_level, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    // Executes the SQL query with the provided parameters and returns the result
    return await db.run(sql, params);
}

/**
 * Inserts a new user preference record into the `user_preferences` table in the database.
 * The function uses the provided parameters to populate the respective fields in the table.
 * 
 * @param {Array} params - An array containing the values to be inserted into the `user_preferences` table.
 *                         The expected order is:
 *                         [preference_id, user_id, preferred_types, preferred_intensity, preferred_duration, preferred_exercise]
 * @returns {Promise} - A promise that resolves when the SQL query is executed.
 */
async function createPreferences(params) {
    // SQL query to insert a new user preference record into the `user_preferences` table
    let sql = `
        INSERT INTO user_preferences (preference_id, user_id, preferred_types, preferred_intensity, preferred_duration, preferred_exercise)
        VALUES (?, ?, ?, ?, ?, ?);
    `;
    // Executes the SQL query with the provided parameters and returns the result
    return await db.run(sql, params);
}

/**
 * Updates an existing user's information in the `users` table based on the provided parameters.
 * The function uses the parameters to update the user's fields such as name, username, password, 
 * email, fitness goal, and experience level.
 * 
 * @param {Array} params - An array containing the new values to update in the `users` table.
 *                         The expected order is:
 *                         [fname, lname, username, password, email, fit_goal, exp_level, user_id]
 *                         The `user_id` is used to identify the record to be updated.
 * @returns {Promise} - A promise that resolves when the SQL query is executed, reflecting the updated user data.
 */
async function updateUser(params) {
    // SQL query to update user details in the `users` table based on `user_id`
    let sql = `
        UPDATE users
        SET fname = ?, lname = ?, username = ?, password = ?,email = ?, fit_goal = ?, exp_level = ?
        WHERE user_id = ?;
    `;
    // Executes the SQL query with the provided parameters and returns the result
    return await db.run(sql, params);
}

/**
 * Deletes a user from the `users` table based on the provided `user_id`.
 * The function uses the `user_id` to identify and remove the corresponding user record from the database.
 * 
 * @param {number} user_id - The ID of the user to be deleted from the `users` table.
 * @returns {Promise} - A promise that resolves when the SQL query is executed and the user is deleted.
 */
async function deleteUser(user_id) {
    // SQL query to delete a user from the `users` table based on the given `user_id`
    let sql = `
        DELETE FROM users WHERE user_id = ?
    `;
    // Executes the SQL query with the provided `user_id` as the parameter
    return await db.run(sql, [user_id]);
}

/**
 * Updates a user's preferences in the `user_preferences` table based on the provided `user_id`.
 * This function updates the fields: `preferred_types`, `preferred_intensity`, `preferred_duration`, and `preferred_exercise`
 * for the given user identified by `user_id`.
 * 
 * @param {Array} params - An array containing the new values for `preferred_types`, `preferred_intensity`,
 *                          `preferred_duration`, `preferred_exercise`, and the `user_id` of the user whose preferences are being updated.
 * @returns {Promise} - A promise that resolves when the SQL query is executed and the user's preferences are updated.
 */
async function updatePreferences(params) {
    // SQL query to update the user's preferences in the `user_preferences` table based on the given `user_id`
    let sql = `
        UPDATE user_preferences
        SET preferred_types = ?, preferred_intensity = ?, preferred_duration = ?, preferred_exercise = ?
        WHERE user_id = ?;
    `;
    // Executes the SQL query with the provided parameters and updates the user's preferences in the database
    return await db.run(sql, params);
}

/**
 * Fetches a user's details from the `users` table based on the provided `user_id`.
 * 
 * @param {number} user_id - The unique identifier of the user whose details need to be fetched.
 * @returns {Promise} - A promise that resolves to the user's details if found, or undefined if no user with the given `user_id` exists.
 */
async function getUser(user_id) {
    // SQL query to select all columns from the `users` table for the given `user_id`
    let sql = `
        SELECT * FROM users WHERE user_id = ?;
    `;
    // Executes the SQL query with the provided `user_id` and returns the result
    return await db.get(sql, user_id);
}

/**
 * Fetches a user's preferences from the `user_preferences` table based on the provided `user_id`.
 * 
 * @param {number} user_id - The unique identifier of the user whose preferences need to be fetched.
 * @returns {Promise} - A promise that resolves to the user's preferences if found, or undefined if no preferences for the given `user_id` exist.
 */
async function getPreferences(user_id) {
    // SQL query to select all columns from the `user_preferences` table for the given `user_id`
    let sql = `
        SELECT * FROM user_preferences WHERE user_id = ?;
    `;
    // Executes the SQL query with the provided `user_id` and returns the result
    return await db.get(sql, user_id);
}

/**
 * Inserts a new record into the `user_injury` table to log an injury for a specific user.
 * 
 * @param {Array} params - An array containing the values for the new injury record. The expected order is:
 *                          [muscle_id, user_id, injury_intensity].
 * 
 * @returns {Promise} - A promise that resolves to the result of the database insertion operation.
 *                      This operation is executed using the `db.run()` method, which performs the SQL insert.
 */
async function createInjury(params) {
    // SQL query to insert a new injury record into the `user_injury` table
    let sql = `
        INSERT INTO user_Injury (muscle_id, user_id, injury_intensity)
        VALUES (?, ?, ?);
    `;
    // Executes the SQL query with the provided parameters and returns the result of the insertion
    return await db.run(sql, params);
}

/**
 * Inserts a new record into the `workout_performance` table to log the performance data for a specific workout.
 * 
 * @param {Array} params - An array containing the values for the new workout performance record. The expected order is:
 *                          [perf_id, exercise_id, actual_sets, actual_reps, actual_weight, perf_date].
 * 
 * @returns {Promise} - A promise that resolves to the result of the database insertion operation.
 *                      This operation is executed using the `db.run()` method, which performs the SQL insert.
 */
async function createWorkoutPerformance(params) {
    // SQL query to insert a new workout performance record into the `workout_performance` table
    /* let sql = `
       INSERT INTO workout_performance (perf_id, exercise_id, actual_sets, actual_reps, actual_weight, perf_date)
        VALUES (?, ?, ?, ?, ?, ?);
    `; */

    let sql = `
       INSERT INTO workout_performance (perf_id, exercise_id, actual_sets, actual_reps, actual_weight, perf_date, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    // Executes the SQL query with the provided parameters and returns the result of the insertion
    return await db.run(sql, params);
}

/**
 * Updates an existing record in the `workout_performance` table with new performance data.
 * 
 * @param {Array} params - An array containing the updated values for the workout performance record. 
 *                          The expected order is: [actual_sets, actual_reps, actual_weight, perf_date, perf_id].
 * 
 * @returns {Promise} - A promise that resolves to the result of the database update operation.
 *                      This operation is executed using the `db.run()` method, which performs the SQL update.
 */
async function updateWorkoutPerfromance(params) {
    // SQL query to update an existing workout performance record in the `workout_performance` table
    /* let sql = `
        UPDATE users
        SET actual_sets = ?, actual_reps = ?, actual_weight = ?, perf_date = ?
        WHERE perf_id = ?;
    `; */

    let sql = `
        UPDATE users
        SET actual_sets = ?, actual_reps = ?, actual_weight = ?, perf_date = ?, user_id = ?
        WHERE perf_id = ?;
    `;
    
    // Executes the SQL query with the provided parameters and returns the result of the update
    return await db.run(sql, params);
}

module.exports = {
    createUser,
    deleteUser,
    updateUser,
    getUser,
    updatePreferences,
    getPreferences,
    createPreferences,
    createInjury,
    createWorkoutPerformance,
    updateWorkoutPerfromance
}