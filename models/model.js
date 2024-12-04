
// "use strict";
const db = require("../models/db-conn");

/**
 * Retrieves all user records from the `users` table.
 * 
 * This function executes a SQL `SELECT` query to fetch all records from the `users` table.
 * The result is returned as an array of user objects.
 * 
 * @returns {Promise} - A promise that resolves to an array of all user records from the `users` table.
 *                       The data is fetched using the `db.all()` method, which returns all rows for the query.
 */
async function getAllUsers() {
    // SQL query to select all records from the `users` table
    let sql = "SELECT * FROM users;";
    // Executes the SQL query to retrieve all user records and returns the result as a promise
    return await db.all(sql);
}

/**
 * Retrieves user preferences along with fitness goal and experience level from the database.
 * 
 * This function executes a SQL query to join the `users` table with the `user_preferences` table
 * and fetch the user's fitness goal (`fit_goal`), experience level (`exp_level`), and their preferences
 * (types, intensity, duration, and exercise) based on their user ID.
 * 
 * @param {number} userId - The ID of the user whose preferences are to be fetched.
 * 
 * @returns {Promise} - A promise that resolves to an object containing the user's preferences 
 *                       and fitness goal if found, or `null` if no matching record exists.
 */
async function getUserPreferences(userId) {
    // SQL query to join `users` and `user_preferences` tables and fetch relevant columns
    const sql = `
        SELECT fit_goal, exp_level, preferred_types, preferred_intensity, preferred_duration, preferred_exercise
        FROM users
        LEFT JOIN user_preferences ON users.user_id = user_preferences.user_id
        WHERE users.user_id = ?;
    `;
    // Executes the SQL query and returns the result as a promise
    // The query will fetch user preferences and fitness-related information for the given `userId`
    return await db.get(sql, [userId]);
}

/**
 * Retrieves the username and password from the database for a given username.
 * 
 * This function executes a SQL query to search for the user's record in the `users` table 
 * using the provided `username`. It returns the username and password for the matched record.
 * 
 * @param {string} username - The username of the user attempting to log in.
 * 
 * @returns {Promise} - A promise that resolves to an object containing the `username` and `password`
 *                       for the matched record, or `null` if no record exists with the provided username.
 */
async function getLogin(username) {
    const sql = "SELECT username, password, user_id AS id FROM users WHERE username = ?;";
    console.log("Executing SQL:", sql, "with parameter:", username); // Debug log

    // Wrap the query execution in a try-catch block
    try {
        const result = await db.get(sql, [username]); // Execute query
        console.log("Query Result:", result); // Log the raw result from db.get
        return result; // Return the fetched result
    } catch (error) {
        console.error("Database Query Error:", error); // Log any SQL execution errors
        throw error; // Re-throw the error for higher-level handling
    }
}




/**
 * Retrieves the details of a workout plan, including its workouts and exercises.
 * 
 * This function executes a SQL query to fetch a workout plan's details, including the start and end 
 * dates, active status, and the associated workouts and exercises. It then structures the results into 
 * a nested format, grouping exercises under their respective workouts.
 * 
 * @param {number} planId - The ID of the workout plan to retrieve details for.
 * 
 * @returns {Promise} - A promise that resolves to an object containing the status and the structured
 *                      workout plan details (if successful), or an error message (if an error occurs).
 */
async function getWorkoutPlanDetails(planId) {
    console.log("getWorkoutPlanDetails called");
    // SQL query to fetch the details of a workout plan, including its workouts and exercises
    const sql = `
    SELECT wp.plan_id, wp.start_date, wp.end_date, wp.active, 
           w.workout_id, e.exercise_id, e.api_id, e.plan_sets, 
           e.plan_reps, e.plan_weight, e.rest_time, 
           e.exercise_name, e.duration, w.intensity
    FROM workout_plans wp
        JOIN workouts w ON wp.plan_id = w.plan_id
        JOIN exercises e ON w.workout_id = e.workout_id
    WHERE wp.plan_id = ? AND wp.active = true;
    `;
    try {
        // Executes the SQL query and retrieves all matching results
        const results = await db.all(sql, [planId]);
        // Logs the planId to verify the query execution
        console.log('planId in SQL:', planId);
        // Group workouts and exercises by workout_id
        const workoutPlans = results.reduce((acc, row) => {
            // Destructuring relevant columns from the query result
            const { workout_id, exercise_id, exercise_name, plan_sets, plan_reps, plan_weight, rest_time, api_id, intensity, duration, plan_id, start_date, end_date, active } = row;
            // Find or create a workout plan object
            let workoutPlan = acc.find(plan => plan.plan_id === plan_id);
            if (!workoutPlan) {
                workoutPlan = {
                    plan_id,
                    start_date,
                    end_date,
                    active,
                    workouts: []
                };
                acc.push(workoutPlan);
            }
            // Find or create a workout object
            let workout = workoutPlan.workouts.find(w => w.workout_id === workout_id);
            if (!workout) {
                workout = {
                    workout_id,
                    exercise_name,
                    intensity,
                    duration,
                    exercises: []
                };
                workoutPlan.workouts.push(workout);
            }
            // Add exercise to the workout
            workout.exercises.push({
                exercise_id,
                api_id,
                plan_sets,
                plan_reps,
                plan_weight,
                rest_time,
                exercise_name
            });
            // Return the updated accumulator
            return acc;
        }, []);
        // Return the structured response
        return { status: "success", workoutPlans };
    } catch (error) {
        // If an error occurs, log it and return an error response
        console.error("Error fetching workout plan details:", error);
        return { status: "error", message: "Error fetching workout plan details" };
    }
}

/**
 * Retrieves workout plans for a specific user, including exercises and muscle filtering.
 * 
 * This function fetches the user's active workout plans, associated workouts, and exercises while 
 * excluding exercises related to muscles with severe injuries (if any). It structures the result 
 * in a nested format, grouping exercises under their respective workouts and workouts under 
 * their corresponding plans.
 * 
 * @param {number} userId - The ID of the user to retrieve workout plans for.
 * 
 * @returns {Promise} - A promise that resolves to an array of structured workout plans, 
 *                      or an empty array if no plans are found.
 */
async function getWorkoutPlans(userId) {
    // WILLS ORIGINAL
    /* const sql = `
    SELECT wp.plan_id, wp.start_date, wp.end_date, wp.active, 
           w.workout_id, e.exercise_id, e.api_id, e.plan_sets, 
           e.plan_reps, e.plan_weight, e.rest_time, 
           e.exercise_name, e.duration, w.intensity
    FROM workout_plans wp
        JOIN workouts w ON wp.plan_id = w.plan_id
        JOIN exercises e ON w.workout_id = e.workout_id
    WHERE wp.user_id = ? AND wp.active = true;
    `; */

    console.log("getWorkoutPlans called");
    // COLLINS MUSCLE FILTERING
    const sql = `SELECT wp.plan_id, wp.start_date, wp.end_date, wp.active, w.*
    FROM users u
    JOIN workout_plans wp ON wp.user_id = u.user_id
    JOIN workouts w ON wp.plan_id = w.plan_id
    JOIN exercises e ON w.workout_id = e.workout_id
    JOIN muscle_workout mw ON w.workout_id = mw.workout_id 
    JOIN muscle m ON m.muscle_id = mw.muscle_id
    LEFT JOIN user_injury ui ON ui.muscle_id = m.muscle_id AND ui.user_id = u.user_id
    WHERE wp.user_id = ? 
    AND wp.active = true 
    AND (ui.injury_intensity IS NULL OR ui.injury_intensity <> 'severe')
    GROUP BY w.workout_id;
    `;
    // Execute the SQL query and retrieve all matching rows for the given userId
    const rows = await db.all(sql, [userId]);
    // Initialize an empty object to store structured workout plans
    const plans = {};
    // Process each row in the result set to group and structure the data
    rows.forEach(row => {
        const planId = row.plan_id;
        // If the plan doesn't exist in the plans object, create it
        if (!plans[planId]) {
            plans[planId] = {
                plan_id: planId,
                user_id: userId,
                start_date: row.start_date,
                end_date: row.end_date,
                active: row.active,
                workouts: []
            };
        }
        // Find or create the workout object within the plan's workouts array
        let workout = plans[planId].workouts.find(w => w.workout_id === row.workout_id);
        if (!workout) {
            workout = {
                workout_id: row.workout_id,
                intensity: row.intensity,
                exercises: []
            };
            plans[planId].workouts.push(workout);
        }
        // Add the exercise to the workout's exercises array
        workout.exercises.push({
            exercise_id: row.exercise_id,
            api_id: row.api_id,
            plan_sets: row.plan_sets,
            plan_reps: row.plan_reps,
            plan_weight: row.plan_weight,
            rest_time: row.rest_time,
            exercise_name: row.exercise_name,
            duration: row.duration
        });
    });
    // Log the structured plans object for debugging purposes
    console.log('Structured Plans Object:', plans);
    // Return the structured plans as an array
    return Object.values(plans);
}

/**
 * Retrieves feedback for a specific workout plan from a specific user.
 * 
 * This function checks the types of the provided `userId` and `planId` to ensure they are valid numbers, 
 * executes an SQL query to fetch feedback (rating and calories burned) from the `user_plan_feedback` table, 
 * and returns the result. If the input types are invalid, the function logs an error and returns null.
 * 
 * @param {number} userId - The ID of the user whose feedback is being fetched.
 * @param {number} planId - The ID of the workout plan whose feedback is being fetched.
 * 
 * @returns {Promise<object|null>} - A promise that resolves to the feedback object containing 
 *                                    `rating` and `total_calories_burned`, or null if invalid input types.
 */
async function getUserPlanFeedback(userId, planId) {
    // Check if both userId and planId are valid numbers
    if (typeof userId !== 'number' || typeof planId !== 'number') {
        console.error("Invalid userId or planId type:", { userId, planId });
        return null;  // Handle error or return empty/null if invalid
    }
    // SQL query to fetch the feedback (rating and total calories burned) for the given user and plan
    const sql = `
        SELECT rating, total_calories_burned 
        FROM user_plan_feedback 
        WHERE user_id = ? AND plan_id = ?;
    `;
    // Execute the SQL query and retrieve the feedback from the database
    const feedback = await db.get(sql, [userId, planId]);
    // Log the feedback for debugging purposes
    console.log("Feedback in getUserPlanFeedback:", feedback);
    // Return the feedback retrieved from the database
    return await db.get(sql, [userId, planId]);
}

/**
 * Stores or updates feedback for a specific workout plan from a specific user.
 * 
 * This function inserts feedback (rating and total calories burned) into the 
 * `user_plan_feedback` table for the given `userId` and `planId`. If feedback 
 * already exists for the combination of `userId` and `planId`, it updates the 
 * existing record with the new `rating` and `total_calories_burned` values.
 * 
 * @param {number} userId - The ID of the user submitting the feedback.
 * @param {number} planId - The ID of the workout plan for which feedback is being submitted.
 * @param {number} rating - The rating given by the user for the workout plan.
 * @param {number} totalCaloriesBurned - The total calories burned by the user during the workout plan.
 * 
 * @returns {Promise} - A promise that resolves when the database operation completes.
 */
async function storeUserPlanFeedback(userId, planId, rating, totalCaloriesBurned) {
    // SQL query to insert or update feedback in the user_plan_feedback table
    const sql = `
        INSERT INTO user_plan_feedback (user_id, plan_id, rating, total_calories_burned)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (user_id, plan_id) DO UPDATE 
        SET rating = excluded.rating, total_calories_burned = excluded.total_calories_burned;
    `;
    // Log the SQL query and parameters for debugging purposes
    console.log(`Executing SQL: ${sql} with parameters: ${userId}, ${planId}, ${rating}, ${totalCaloriesBurned}`);
    // Execute the SQL query with the provided parameters (userId, planId, rating, totalCaloriesBurned)
    return await db.run(sql, [userId, planId, rating, totalCaloriesBurned]);
}

/**
 * Retrieves all workout plans for a specific user from the database.
 * 
 * This function fetches workout plans associated with the given `userId` and returns 
 * the corresponding data including the plan details (plan ID, start date, end date, 
 * and active status) along with the workouts associated with each plan (workout ID, 
 * intensity). It uses a SQL query to join the `workout_plans` and `workouts` tables.
 * 
 * @param {number} userId - The ID of the user whose workout plans are to be retrieved.
 * @returns {Promise} - A promise that resolves with the rows of data representing the user's workout plans.
 * @throws {Error} - Throws an error if the `userId` is invalid.
 */
async function getUserWorkoutPlans(userId) {
    // Check if the userId is valid (non-null and a number)
    if (!userId || isNaN(userId)) {
        throw new Error('Invalid User ID');
    }
    // Log the userId being processed (for debugging purposes)
    console.log("Fetching workout plans for User ID:", userId);
    // Return a new Promise to handle the asynchronous database operation
    return new Promise((resolve, reject) => {
        // Perform the SQL query to fetch workout plans and associated workouts
        db.all(
            `
            SELECT wp.plan_id, wp.start_date, wp.end_date, wp.active,
                   w.workout_id, w.intensity
            FROM workout_plans wp
            LEFT JOIN workouts w ON wp.plan_id = w.plan_id
            WHERE wp.user_id = ?;
            `, //need add muscles to this exercise has a workout id 
            [userId],
            (err, rows) => {
                if (err) {
                    // If there's an error, log it and reject the promise
                    console.error("SQL Error:", err);
                    return reject(err);
                }
                // Resolve the promise with the fetched rows
                resolve(rows);
            }
        );
    });
}

// Q-table and reinforcement learning logic
let QTable = {};

/**
 * Retrieves the Q-value for a given user, state, and action from the database.
 * 
 * The function checks if the input parameters are valid, performs an SQL query to 
 * fetch the Q-value associated with the provided `userId`, `state`, and `action`, 
 * and returns the Q-value if found. If the Q-value is not found or the parameters 
 * are invalid, it returns 0.
 * 
 * @param {number} userId - The ID of the user for whom the Q-value is being fetched.
 * @param {string} state - The state in the reinforcement learning process for which the Q-value is being fetched.
 * @param {number} action - The action (workout plan or exercise) corresponding to the Q-value.
 * @returns {number} - The Q-value associated with the provided parameters, or 0 if not found or invalid.
 */
async function getQValue(userId, state, action) {
    // Validate the input parameters
    if (typeof userId !== 'number' || typeof state !== 'string' || typeof action !== 'number') {
        // Log an error if any of the parameters are of the wrong type
        console.error("Invalid parameter types:", { userId, state, action });
        return 0;
    }
    // Define the SQL query to fetch the Q-value for the given user, state, and action
    const sql = `
        SELECT q_value
        FROM q_values
        WHERE user_id = ? AND state = ? AND action = ?;
    `;
    // Log the input values for debugging purposes
    console.log(`Inputs - userId: ${userId}, state: ${state}, action: ${action}`);
    // Execute the SQL query to retrieve the Q-value from the database
    const result = await db.get(sql, [userId, state, action]);
    // Log the result of the SQL query for debugging purposes
    console.log(`SQL in getQvalue: ${result}`);
    // Return the Q-value if found, otherwise return
    return result ? result.q_value : 0;
}

/**
 * Inserts or updates a Q-value for a given user, state, and action in the database.
 * 
 * This function attempts to insert a new record into the `q_values` table for a specified 
 * `userId`, `state`, and `action`. If a record with the same `userId`, `state`, and `action` 
 * already exists, it updates the existing record with the new `q_value`.
 * 
 * @param {number} userId - The ID of the user for whom the Q-value is being inserted or updated.
 * @param {string} state - The state in the reinforcement learning process for which the Q-value is being upserted.
 * @param {number} action - The action (workout plan or exercise) for which the Q-value is being upserted.
 * @param {number} qValue - The new Q-value to be inserted or updated.
 */
async function upsertQValue(userId, state, action, qValue) {
    // Log the details of the upsert operation for debugging purposes
    console.log(`Upserting Q-value: User ID: ${userId}, State: ${state}, Action: ${action}, Q-Value: ${qValue}`);
    // Define the SQL query for the upsert operation
    const sql = `
        INSERT INTO q_values (user_id, state, action, q_value)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (user_id, state, action) DO UPDATE
        SET q_value = excluded.q_value;
    `;
    // Execute the SQL query to insert or update the Q-value in the database
    await db.run(sql, [userId, state, action, qValue]);
}

/**
 * Fetches all distinct actions for a given user and state from the `q_values` table.
 * 
 * This function retrieves all unique actions that a user has performed for a particular state 
 * in the reinforcement learning system. It queries the database for the actions associated with 
 * the given `userId` and `state`, and returns them as an array.
 * 
 * @param {number} userId - The ID of the user whose actions are being fetched.
 * @param {string} state - The state for which actions need to be fetched.
 * 
 * @returns {Promise<Array<number>>} - A promise that resolves to an array of actions (numbers) 
 * corresponding to the given `userId` and `state`.
 */
async function getActionsForState(userId, state) {
    try {
        // SQL query to fetch distinct actions for a given user and state
        const query = `
            SELECT DISTINCT action
            FROM q_values 
            WHERE user_id = ? AND state = ?;
        `;
        // Execute the query and get the results
        const results = await db.all(query, [userId, state]);
        // Log the query results for debugging purposes
        console.log('Query results:', results);
        // Extract actions from query results
        return results.map(row => row.action);
    } catch (error) {
        // Log any errors that occur during the query execution
        console.error(`Error fetching actions for state "${state}":`, error);
        // Rethrow the error to be handled by the calling code
        throw error;
    }
}

/**
 * Calculates the maximum Q-value for the next state given the user's actions.
 * 
 * This function retrieves all possible actions for a given user and next state, then calculates 
 * the corresponding Q-values for each action. The function returns the highest Q-value from 
 * the set of available actions. If there are no actions for the next state or if an error 
 * occurs during the process, the function returns 0 as the default value.
 * 
 * @param {number} userId - The ID of the user for whom the Q-values are being calculated.
 * @param {string} nextState - The state for which the maximum future Q-value needs to be calculated.
 * 
 * @returns {Promise<number>} - A promise that resolves to the maximum Q-value for the next state,
 * or 0 if there are no available actions or an error occurs.
 */
async function calculateMaxFutureQ(userId, nextState) {
    try {
        // Retrieve all actions for the next state for the given user
        const actions = await getActionsForState(userId, nextState);
        // If no actions are available for the next state, return 0 as the maximum Q-value
        if (actions.length === 0) {
            return 0; // No actions available for the next state
        }
        // Get the Q-values for all available actions in the next state
        const qValues = await Promise.all(
            actions.map(action => getQValue(userId, nextState, action))
        );
        // Return the maximum Q-value, filtering out any undefined values (if no Q-value found for an action)
        return Math.max(0, ...qValues.filter(q => q !== undefined)); // Filter out undefined Q-values
    } catch (error) {
        // Log the error if an issue occurs during the calculation
        console.error(`Error calculating maxFutureQ for state: ${nextState}`, error);
        // Default to 0 in case of error
        return 0;
    }
}

// BELLMAN EQUATION
/**
 * Updates the Q-value for a given user, state, and action based on the Q-learning algorithm.
 * 
 * This function calculates the new Q-value for a user-state-action combination by applying the
 * Q-learning formula: 
 * 
 * Q(s, a) ← Q(s, a) + α * [r + γ * max(Q(s', a')) - Q(s, a)],
 * 
 * where:
 * - α is the learning rate (determines how much new information overrides the old).
 * - γ is the discount factor (how much future rewards are considered).
 * - r is the immediate reward.
 * - max(Q(s', a')) is the maximum future Q-value for the next state.
 * - Q(s, a) is the current Q-value.
 * 
 * The function ensures that the userId, state, nextState, and action are valid, retrieves the 
 * current Q-value and the maximum future Q-value, then calculates and updates the Q-value 
 * in the database.
 * 
 * @param {number|string} userId - The ID of the user for whom the Q-value is being updated.
 * @param {string} state - The current state of the user.
 * @param {number} action - The action taken by the user in the given state.
 * @param {number} reward - The immediate reward received for taking the action in the current state.
 * @param {string} nextState - The state the user will transition to after taking the action.
 * 
 * @throws {Error} Throws an error if invalid parameters are provided.
 */
async function updateQValue(userId, state, action, reward, nextState) {
    console.log("updateQValue called");
    // Q-learning hyperparameters
    // Learning rate (α)
    const learningRate = 0.1;
    // Discount factor (γ)
    const discountFactor = 0.9;
    // Ensure userId is valid
    if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
        throw new Error('Invalid User ID');
    }
    // Ensure state and nextState are valid strings
    if (!state || typeof state !== 'string') {
        throw new Error('Invalid State');
    }
    // Validate state (must be a string)
    if (!nextState || typeof nextState !== 'string') {
        throw new Error('Invalid Next State');
    }
    // Ensure action is a number, convert if necessary
    action = Number(action); // Convert action to a number if it's not already
    if (isNaN(action)) {
        console.error(`Invalid action type: ${typeof action}, value: ${action}`);
        throw new Error('Invalid Action');
    }
    // Convert nextState to string
    nextState = String(nextState);
    try {
        // Get current Q-value and max future Q-value
        const currentQ = await getQValue(userId, state, action) || 0;
        console.log(`Current Q: ${currentQ}`);
        // need to transfer this from the QTable to db q-table
        // this (below) is always 0 because QTable is no longer init
        // Get the maximum future Q-value for the next state (max Q(s', a'))
        //const maxFutureQ = Math.max(0, ...Object.values(QTable[nextState] || {}));
        // use this, correct way to do it
        const maxFutureQ = await calculateMaxFutureQ(userId, nextState);
        console.log(`Max future Q: ${maxFutureQ}`);
        // Ensure reward is a valid number
        const validReward = typeof reward === 'number' && !isNaN(reward) ? reward : 0;
        // Apply the Q-learning update formula to compute the new Q-value
        const newQ = currentQ + learningRate * (validReward + discountFactor * maxFutureQ - currentQ);
        console.log(`New Q: ${newQ}`);
        // Update the Q-value in the database using upsert (insert or update)
        await upsertQValue(userId, state, action, newQ);
    } catch (error) {
        // Log any errors that occur during the process and rethrow the error
        console.error(`Error updating Q-value: ${error.message}`, {
            userId, state, action, reward, nextState
        });
        throw error; // Rethrow to bubble up
    }
}

/**
 * Calculates the reward based on the user's feedback.
 * The reward is computed by combining the user's rating and the total calories burned during the workout.
 * 
 * Formula:
 * - ratingReward = feedback.rating (The user's rating for the workout plan or exercise)
 * - performanceReward = feedback.total_calories_burned / 100 (A reward based on the calories burned, scaled by 100)
 * 
 * The total reward is the sum of the ratingReward and performanceReward.
 * 
 * @param {Object} feedback - The feedback object containing the user's rating and total calories burned.
 * @param {number} feedback.rating - The rating given by the user (assumed to be a number).
 * @param {number} feedback.total_calories_burned - The total number of calories burned during the workout.
 * 
 * @returns {number} - The calculated reward. Defaults to 0 if the feedback is missing or invalid.
 */
function calculateReward(feedback) {
    // Check if feedback is valid and contains required properties (rating and total_calories_burned)
    if (!feedback || typeof feedback.rating !== 'number' || typeof feedback.total_calories_burned !== 'number') {
        return 0; // Default reward if feedback is missing or invalid
    }
    // Calculate the reward based on rating and performance (calories burned)
    const ratingReward = feedback.rating;
    const performanceReward = feedback.total_calories_burned / 100;
    // Return the total reward as the sum of ratingReward and performanceReward
    return ratingReward + performanceReward;
}

/**
 * Retrieves the epsilon value (exploration rate) for a specific user from the database.
 * Epsilon is used in reinforcement learning algorithms to control the balance between exploration and exploitation.
 * 
 * @param {number} userId - The ID of the user whose epsilon value is to be retrieved.
 * 
 * @returns {number|null} - The epsilon value for the user if found, otherwise null.
 *         Returns null if the user does not have an epsilon value stored.
 */
async function getEpsilon(userId) {
    // SQL query to fetch the epsilon value for the specified user from the user_rl_state table
    const sql = `
        SELECT epsilon 
        FROM user_rl_state 
        WHERE user_id = ?;
    `;
    // Execute the SQL query and await the result
    const result = await db.get(sql, [userId]);
    // If the result exists, return the epsilon value; otherwise, return null
    return result ? result.epsilon : null;
}

/**
 * Updates or inserts the epsilon value (exploration rate) for a specific user in the database.
 * If the user already has an epsilon value, it will be updated. If not, a new entry will be inserted.
 * 
 * @param {number} userId - The ID of the user whose epsilon value is to be updated or inserted.
 * @param {number} newEpsilon - The new epsilon value to be set for the user.
 * 
 * @returns {Promise<void>} - A promise that resolves once the SQL query has been executed.
 */
async function updateEpsilon(userId, newEpsilon) {
    // SQL query to insert or update the epsilon value for the specified user.
    // If the user_id already exists, the epsilon value will be updated.
    // If the user_id doesn't exist, a new row will be inserted.
    const sql = `
        INSERT INTO user_rl_state (user_id, epsilon)
        VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET epsilon = excluded.epsilon;
    `;
    // Execute the SQL query with the userId and newEpsilon as parameters
    await db.run(sql, [userId, newEpsilon]);
}

/**
 * Chooses an action for a user based on an epsilon-greedy strategy (exploration vs exploitation) and retrieves the corresponding workout plan.
 * 
 * @param {number} userId - The ID of the user for whom the action is to be chosen.
 * @param {string} state - The current state of the user, used to select available actions.
 * 
 * @returns {Promise<Object|null>} - A promise that resolves with the corresponding workout plan if an action is chosen, or null if no action or plan is found.
 */
async function chooseAction(userId, state) {
    // Fetch the epsilon value for the user, which controls the exploration vs exploitation balance.
    const epsilon = await getEpsilon(userId);
    // If epsilon is not found or not initialized for the user, log an error and return null.
    if (epsilon === null) {
        console.error("Epsilon not initialized for user:", userId);
        return null;
    }
    // SQL query to fetch all actions and their associated Q-values for the given user and state.
    const sql = `
        SELECT action, q_value
        FROM q_values
        WHERE user_id = ? AND state = ?;
    `;
    // Execute the query to retrieve actions for the specified user and state.
    const actions = await db.all(sql, [userId, state]);
    // If no actions are found for the user and state, log a message and return null.
    if (!actions || actions.length === 0) {
        console.log("No actions found for this user and state.");
        return null;
    }
    // Variable to hold the selected action
    let selectedAction;
    // Epsilon-greedy strategy: Choose either to explore (random action) or exploit (best action).
    if (Math.random() < epsilon) {
        // Exploration: Randomly choose an action from the available actions.
        const randomIndex = Math.floor(Math.random() * actions.length);
        selectedAction = actions[randomIndex];
        console.log("Exploring: Chose random action:", selectedAction.action);
    } else {
        // Exploitation: Select the action with the highest Q-value (best action).
        selectedAction = actions.reduce((best, action) =>
            action.q_value > best.q_value ? action : best
        );
        console.log("Exploiting: Chose best action:", selectedAction.action);
    }
    // SQL query to fetch the full workout plan for the selected action (plan_id).
    const planSql = `
        SELECT * 
        FROM workout_plans 
        WHERE plan_id = ?;
    `;
    // Execute the query to retrieve the workout plan for the selected action.
    const plan = await db.get(planSql, [selectedAction.action]);
    // If no plan is found for the selected action, log a message and return null.
    if (!plan) {
        console.log("No plan found for plan_id:", selectedAction.action);
        return null;
    }
    // Log and return the fetched workout plan.
    console.log("Fetched full workout plan:", plan);
    return plan;
}

function determineNextState(currentState, feedback, performanceMetrics, userPreferences) {
    return currentState;
}

// ADD FOR STATE CHANGE IMPLEMENTATION
//function determineNextState(currentState, feedback, performanceMetrics, userPreferences) {

// NEED THIS EVENTUALLY
// Check for manual preference adjustments from userPreferences
/* if (userPreferences.updated) {
    // If the user manually updated their preferences, change the state accordingly
    nextState = `${userPreferences.goal}${userPreferences.level}`;
} */

/* console.log(`Test Current State viewing: ${currentState}`);
console.log(`Performance Metrics in determineNextState viewing: ${JSON.stringify(performanceMetrics)}`);
console.log(`Current State viewing: ${currentState}`);
console.log(`Feedback viewing: ${JSON.stringify(feedback)}`);

// Define thresholds for feedback and performance
const feedbackThreshold = 3; // Threshold for low ratings triggering a state change
const performanceThreshold = 5; // Threshold for performance improvement triggering state progression */

// DONT USE
// Example state mappings based on feedback and performance
/* const stateMapping = {
    "StrengthBeginner": "StrengthIntermediate",
    "StrengthIntermediate": "StrengthAdvanced",
    "CardioBeginner": "CardioIntermediate",
    "CardioIntermediate": "CardioAdvanced",

    // ADDED
    "StrengthAdvanced": "StrengthBeginner"
};
let nextState = currentState; */

// ADDED FOR STATE CHANGE UPDATE IN DB, USE
/* const stateMapping = {
    "StrengthBeginner": { fitGoal: "Strength", expLevel: "Intermediate" },
    "StrengthIntermediate": { fitGoal: "Strength", expLevel: "Advanced" },
    "CardioBeginner": { fitGoal: "Cardio", expLevel: "Intermediate" },
    "CardioIntermediate": { fitGoal: "Cardio", expLevel: "Advanced" },
    "StrengthAdvanced": { fitGoal: "Strength", expLevel: "Beginner" }
};
let nextState = { fitGoal: currentState.split(/(?=[A-Z])/)[0], expLevel: currentState.split(/(?=[A-Z])/)[1] };

// Evaluate user feedback (positive or negative)
if (feedback.rating < feedbackThreshold) {
    // If feedback is consistently low, consider transitioning to a different workout focus or difficulty level
    if (currentState.includes("Strength")) {
        //nextState = "CardioBeginner"; // Transition to cardio if strength is poorly rated
        nextState = { fitGoal: "Cardio", expLevel: "Beginner" };
    } else if (currentState.includes("Cardio")) {
        //nextState = "StrengthBeginner"; // Transition to strength if cardio is poorly rated
        nextState = { fitGoal: "Strength", expLevel: "Beginner" };
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
} */

/**
 * Filters workout plans for a user based on their injury status, ensuring that only plans 
 * with exercises that don't involve severe injuries are returned.
 * 
 * @param {number} userId - The ID of the user for whom the workout plans are being filtered.
 * 
 * @returns {Promise<Object|null>} - A promise that resolves with the filtered workout plan(s) for the user or null if no plans match.
 */
async function injuryFilter(userId) {
    // SQL query to filter workout plans based on the user's injury status.
    const sql = `
        SELECT wp.*
        FROM workout_plans wp
            JOIN workouts w ON wp.plan_id = w.plan_id
            JOIN exercises e ON w.workout_id = e.workout_id
            LEFT JOIN muscle_workout mw ON w.workout_id = mw.workout_id
            LEFT JOIN user_injury ui ON mw.muscle_id = ui.muscle_id
            WHERE wp.user_id = ? AND ( wp.active = true AND ui.injury_intensity <> 'severe')
    `;
    // Execute the SQL query and return the result, which is a promise that resolves to the filtered workout plan(s).
    return await db.get(sql, [userId]);
}

// NO DETERMINE NEXT STATE
async function recommendWorkoutPlansWithRL(userPreferences, workoutPlans, userId) {
    const state = String(userPreferences.fit_goal) + String(userPreferences.exp_level);
    const availablePlans = workoutPlans;
    // Choose a workout plan (action) based on the current state
    const recommendedPlan = await chooseAction(userId, state);
    if (!recommendedPlan || !recommendedPlan.plan_id) {
        console.log("Invalid recommendedPlan:", recommendedPlan);
        return { error: "No valid plan recommended." };
    }
    console.log("Feedback in recommendWorkoutPlansWithRL:");
    // Get feedback after the plan is completed
    const feedback = await getUserPlanFeedback(userId, recommendedPlan.plan_id);
    console.log("Feedback:", feedback); // Log the feedback to see if it's undefined or missing properties
    const reward = calculateReward(feedback);
    console.log(`Reward for User ID: ${userId}, Plan ID: ${recommendedPlan.plan_id}: ${reward}`);

    // Use the current state as the next state
    // USE FOR NO STATE CHANGE
    const nextState = state;

    // ADD FOR STATE CHANGE IMPLEMENTATION
    //const performanceMetrics = await getPerformanceMetrics(recommendedPlan.plan_id);
    //const nextState = determineNextState(state, feedback, performanceMetrics, userPreferences);
    // ADDED FOR DB NEXT STATE UPDATE TEST
    //const { fitGoal, expLevel } = nextState;
    //await updateUserState(userId, fitGoal, expLevel);

    console.log(`State: ${state}, Next State: ${nextState}, Feedback Rating: ${feedback.rating}`);
    const workoutPlan = await getWorkoutPlanDetails(recommendedPlan.plan_id);
    return workoutPlan;
}

/**
 * Retrieves all muscles from the database.
 * 
 * @returns {Promise<Array>} - A promise that resolves with an array of all muscles from the 'muscle' table.
 */
async function getAllMuscles() {
    // SQL query to select all columns from the 'muscle' table
    let sql = "SELECT * FROM muscle;";
    // Execute the query and return the result as a promise.
    return await db.all(sql);
}

// if the user has a mild injury the we should likely pick a lighter weight
async function filterInjuries(workoutPlans, userID) {
    //get the users injuries
    //get the workouts that hit these
    //the above can be two sql statements that will be filtered by a join
    //filter
}

/**
 * Retrieves a user's details along with injury and muscle information from the database.
 * 
 * @param {number} user_id - The ID of the user to fetch data for.
 * @returns {Promise<Array>} - A promise that resolves to an array containing the user's details and associated injury/muscle information.
 */
async function getUser(user_id) {
    // SQL query to retrieve user details along with related injury and muscle data
    let sql = `SELECT u.user_id,u.fname,u.lname,u.username,u.password,u.email,u.fit_goal,u.exp_level,u.created_at,ui.muscle_id,m.muscle_name,m.muscle_position, ui.injury_intensity
   FROM users u
       LEFT JOIN user_injury  ui ON ui.user_id = u.user_id
       LEFT JOIN muscle m ON ui.muscle_id = m.muscle_id
       WHERE u.user_id = ?
    ;`;
    // Execute the query and return the result as a promise
    return await db.all(sql, [user_id]);
}

/**
 * Retrieves performance metrics (sets, reps, weight, and rest time) for exercises associated with a specific workout plan.
 * 
 * @param {number} planId - The ID of the workout plan for which performance metrics need to be fetched.
 * @returns {Promise<Array>} - A promise that resolves to an array of performance metrics for the exercises in the specified plan.
 */
async function getPerformanceMetrics(planId) {
    // SQL query to select the performance metrics (sets, reps, weight, and rest time) for exercises associated with the given planId
    const query = `
        SELECT plan_sets, plan_reps, plan_weight, rest_time
        FROM exercises
        WHERE workout_id IN (
            SELECT workout_id
            FROM workouts
            WHERE plan_id = ?
        );
    `;
    // Execute the query with the provided planId as a parameter and return the results.
    // db.all executes the query and returns all the matching rows.
    return await db.all(query, [planId]);
}

/**
 * Updates the fitness goal and experience level of a user in the database.
 * 
 * @param {number} userId - The ID of the user whose state (fitness goal and experience level) needs to be updated.
 * @param {string} fitGoal - The new fitness goal to set for the user (e.g., 'Weight loss', 'Muscle gain').
 * @param {string} expLevel - The new experience level to set for the user (e.g., 'Beginner', 'Intermediate', 'Advanced').
 * @returns {Promise} - A promise that resolves when the update operation is complete.
 */
async function updateUserState(userId, fitGoal, expLevel) {
    // SQL query to update the user's fitness goal and experience level in the 'users' table
    const query = `UPDATE users SET fit_goal = ?, exp_level = ? WHERE user_id = ?`;
    // Parameters to be passed into the query: the new fitness goal, experience level, and userId.
    const params = [fitGoal, expLevel, userId];
    // Execute the SQL query asynchronously using the db.run() method to perform the update.
    // The db.run() method does not return results, only a promise indicating the completion of the operation.
    return await db.run(query, params);
}

/**
 * Retrieves the performance data for a specific user, including planned and actual workout metrics.
 * 
 * @param {number} userId - The ID of the user whose workout performance data needs to be retrieved.
 * @returns {Promise} - A promise that resolves to the performance data for the specified user.
 */
async function getWorkoutPerformance(userId) {
    // SQL query to retrieve exercise performance data (planned vs actual) for a given user.
    const sql = `
        SELECT e.exercise_name, e.plan_reps, wp.actual_reps, e.plan_sets,wp.actual_sets,e.plan_weight,wp.actual_weight
    FROM workout_performance wp
        JOIN exercises e ON wp.exercise_id = e.exercise_id
        JOIN workouts w ON w.workout_id = e.workout_id
        JOIN workout_plans ww ON ww.plan_id = w.plan_id
        JOIN users u ON u.user_id = ww.user_id
    WHERE u.user_id = ?;
    `;
    // Execute the SQL query and retrieve the data from the database. The userId is passed as a parameter to filter the data.
    return await db.get(sql, [userId]);
}

/**
 * Retrieves the workout history of a specific user, including exercise performance data.
 * 
 * @param {number} user_id - The ID of the user whose workout history needs to be retrieved.
 * @returns {Promise} - A promise that resolves to the user's workout history data.
 */
async function getUserHistory(user_id){
    // SQL query to retrieve the user's workout history, including exercise performance data
    const query = `
    SELECT u.user_id,u.fname,u.lname,wpr.perf_id,e.exercise_name, wpr.actual_sets,wpr.actual_reps,wpr.actual_weight,wpr.perf_date
    FROM users u
    JOIN workout_plans wpl ON wpl.user_id = u.user_id
    JOIN workouts w ON w.plan_id = wpl.plan_id
    JOIN exercises e ON e.workout_id = w.workout_id
    JOIN workout_performance wpr ON wpr.exercise_id = e.exercise_id
    WHERE wpl.user_id = ?
    ORDER BY wpr.perf_date
    ;`;
    // Execute the SQL query and retrieve the user's workout history. The user_id is passed as a parameter to filter the data.
    return await db.all(query, [user_id]);
}

module.exports = {
    calculateMaxFutureQ,
    getActionsForState,
    getAllUsers,
    getUserPreferences,
    getWorkoutPlans,
    getUserPlanFeedback,
    storeUserPlanFeedback,
    recommendWorkoutPlansWithRL,
    getUserWorkoutPlans,
    calculateReward,
    chooseAction,
    updateQValue,
    getQValue,
    upsertQValue,
    getAllMuscles,
    getUser,
    getPerformanceMetrics,
    getLogin,
    getWorkoutPerformance,
    updateUserState,
    getWorkoutPlanDetails,
    getUserHistory,
    updateEpsilon,
    getEpsilon
};