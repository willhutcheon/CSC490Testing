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
    let sql = `
        INSERT INTO users (user_id, fname, lname, username, password, email, fit_goal, exp_level, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    return await db.run(sql, params);
}

async function createPreferences(params) {
    let sql = `
        INSERT INTO user_preferences (preference_id, user_id, preferred_types, preferred_intensity, preferred_duration, preferred_exercise)
        VALUES (?, ?, ?, ?, ?, ?);
    `;
    return await db.run(sql, params);
}

async function updateUser(params) {
    let sql = `
        UPDATE users
        SET fname = ?, lname = ?, username = ?, password = ?,email = ?, fit_goal = ?, exp_level = ?
        WHERE user_id = ?;
    `;
    return await db.run(sql, params);
}

async function deleteUser(user_id) {
    let sql = `
        DELETE FROM users WHERE user_id = ?
    `;
    return await db.run(sql, [user_id]);
}
async function updatePreferences(params) {
    let sql = `
        UPDATE user_preferences
        SET preferred_types = ?, preferred_intensity = ?, preferred_duration = ?, preferred_exercise = ?
        WHERE user_id = ?;
    `;
    return await db.run(sql, params);
}

async function getUser(user_id) {
    let sql = `
        SELECT * FROM users WHERE user_id = ?;
    `;
    return await db.get(sql, user_id);
}

async function getPreferences(user_id) {
    let sql = `
        SELECT * FROM user_preferences WHERE user_id = ?;
    `;
    return await db.get(sql, user_id);
}

async function createInjury(params) {
    let sql = `
        INSERT INTO user_Injury (muscle_id, user_id, injury_intensity)
        VALUES (?, ?, ?);
    `;
    return await db.run(sql, params);
}

async function createWorkoutPerformance(params) {
    let sql = `
       INSERT INTO workout_performance (perf_id, exercise_id, actual_sets, actual_reps, actual_weight, perf_date)
        VALUES (?, ?, ?, ?, ?, ?);
    `;
    return await db.run(sql, params);
}

async function updateWorkoutPerfromance(params) {
    let sql = `
        UPDATE users
        SET actual_sets = ?, actual_reps = ?, actual_weight = ?, perf_date = ?
        WHERE perf_id = ?;
    `;
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