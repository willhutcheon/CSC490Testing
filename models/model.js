"use strict";
const db = require("../models/db-conn");
// added
// const controller = require("../controllers/controller");
// model.js
// const { determineNextState } = require('../controllers/controller');
// console.log(controller); // Check what is imported



// Fetch all users
async function getAllUsers() {
    let sql = "SELECT * FROM users;";
    return await db.all(sql);
}

// Fetch user preferences including fitness goals and experience level
async function getUserPreferences(userId) {
    const sql = `
        SELECT fit_goal, exp_level, preferred_types, preferred_intensity, preferred_duration, preferred_exercise
        FROM users
        LEFT JOIN user_preferences ON users.user_id = user_preferences.user_id
        WHERE users.user_id = ?;
    `;
    return await db.get(sql, [userId]);
}

// KEEP THIS, WORKS
// Fetch active workout plans for the user, including associated workouts and exercises
//for severe workouts just modify this
async function getWorkoutPlans(userId) {
    const sql = `
    SELECT wp.plan_id, wp.start_date, wp.end_date, wp.active, 
           w.workout_id, e.exercise_id, e.api_id, e.plan_sets, 
           e.plan_reps, e.plan_weight, e.rest_time, 
           e.exercise_name, w.intensity, w.duration
    FROM workout_plans wp
        JOIN workouts w ON wp.plan_id = w.plan_id
        JOIN exercises e ON w.workout_id = e.workout_id
    WHERE wp.user_id = ? AND wp.active = true;
    `;

    const rows = await db.all(sql, [userId]);

    console.log('Raw SQL Result Rows:', rows);


    const plans = {};

    rows.forEach(row => {
        const planId = row.plan_id;

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

        let workout = plans[planId].workouts.find(w => w.workout_id === row.workout_id);
        if (!workout) {
            workout = {
                workout_id: row.workout_id,
                intensity: row.intensity,
                duration: row.duration,
                exercises: []
            };
            plans[planId].workouts.push(workout);
        }

        workout.exercises.push({
            exercise_id: row.exercise_id,
            api_id: row.api_id,
            plan_sets: row.plan_sets,
            plan_reps: row.plan_reps,
            plan_weight: row.plan_weight,
            rest_time: row.rest_time,
            exercise_name: row.exercise_name
        });
    });

    console.log('Structured Plans Object:', plans);
    return Object.values(plans);

}


// Fetch user feedback for a workout plan
async function getUserPlanFeedback(userId, planId) {
    const sql = `
        SELECT rating, total_calories_burned 
        FROM user_plan_feedback 
        WHERE user_id = ? AND plan_id = ?;
    `;
    return await db.get(sql, [userId, planId]);
}

// Store feedback for a workout plan
async function storeUserPlanFeedback(userId, planId, rating, totalCaloriesBurned) {
    const sql = `
        INSERT INTO user_plan_feedback (user_id, plan_id, rating, total_calories_burned)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (user_id, plan_id) DO UPDATE 
        SET rating = excluded.rating, total_calories_burned = excluded.total_calories_burned;
    `;
    console.log(`Executing SQL: ${sql} with parameters: ${userId}, ${planId}, ${rating}, ${totalCaloriesBurned}`);
    return await db.run(sql, [userId, planId, rating, totalCaloriesBurned]);
}


// ADDDED
async function getUserWorkoutPlans(userId) {
    if (!userId || isNaN(userId)) {
        throw new Error('Invalid User ID');
    }

    console.log("Fetching workout plans for User ID:", userId);

    return new Promise((resolve, reject) => {
        db.all(
            `
            SELECT wp.plan_id, wp.start_date, wp.end_date, wp.active,
                   w.workout_id, w.exercise_name, w.intensity, w.duration
            FROM workout_plans wp
            LEFT JOIN workouts w ON wp.plan_id = w.plan_id
            WHERE wp.user_id = ?;
            `, //need add muscles to this exercise has a workout id 
            [userId],
            (err, rows) => {
                if (err) {
                    console.error("SQL Error:", err);
                    return reject(err);
                }
                resolve(rows);
            }
        );
    });
}



// Q-table and reinforcement learning logic
let QTable = {};

// Get Q-value for a specific state-action pair
/* function getQValue(state, action) {
    return QTable[state]?.[action] || 0;
} */

// ADDED, above works
async function getQValue(userId, state, action) {
    const sql = `
        SELECT q_value
        FROM q_values
        WHERE user_id = ? AND state = ? AND action = ?;
    `;
    const result = await db.get(sql, [userId, state, action]);
    return result ? result.q_value : 0; // Return the Q-value if found, otherwise return 0
}


// ADDED
async function upsertQValue(userId, state, action, qValue) {

    console.log(`Upserting Q-value: User ID: ${userId}, State: ${state}, Action: ${action}, Q-Value: ${qValue}`);

    const sql = `
        INSERT INTO q_values (user_id, state, action, q_value)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (user_id, state, action) DO UPDATE
        SET q_value = excluded.q_value;
    `;
    await db.run(sql, [userId, state, action, qValue]);
}



// ADDED
async function updateQValue(userId, state, action, reward, nextState) {
    const learningRate = 0.1;
    const discountFactor = 0.9;

    // Ensure userId is valid
    if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
        throw new Error('Invalid User ID');
    }

    // Ensure state and nextState are valid strings
    if (!state || typeof state !== 'string') {
        throw new Error('Invalid State');
    }

    if (!nextState || typeof nextState !== 'string') {
        throw new Error('Invalid Next State');
    }

    // Ensure action is a number, convert if necessary
    action = Number(action); // Convert action to a number if it's not already
    if (isNaN(action)) {
        console.error(`Invalid action type: ${typeof action}, value: ${action}`);
        throw new Error('Invalid Action');
    }

    nextState = String(nextState);

    try {
        // Get current Q-value and max future Q-value
        const currentQ = await getQValue(userId, state, action) || 0;
        const maxFutureQ = Math.max(0, ...Object.values(QTable[nextState] || {}));

        // Ensure reward is a valid number
        const validReward = typeof reward === 'number' && !isNaN(reward) ? reward : 0;

        // Update the Q-value with Q-learning formula
        const newQ = currentQ + learningRate * (validReward + discountFactor * maxFutureQ - currentQ);
        await upsertQValue(userId, state, action, newQ);
    } catch (error) {
        console.error(`Error updating Q-value: ${error.message}`, {
            userId, state, action, reward, nextState
        });
        throw error; // Rethrow to bubble up
    }
}









// Calculate reward based on user feedback (rating and calories burned)
/* function calculateReward(feedback) {
    const ratingReward = feedback.rating;
    const performanceReward = feedback.total_calories_burned / 100;
    return ratingReward + performanceReward;
}
 */

// ADDED, above works
function calculateReward(feedback) {
    if (!feedback || typeof feedback.rating !== 'number' || typeof feedback.total_calories_burned !== 'number') {
        return 0; // Default reward if feedback is missing or invalid
    }

    const ratingReward = feedback.rating;
    const performanceReward = feedback.total_calories_burned / 100;

    return ratingReward + performanceReward;
}


// Choose the best workout plan (action) based on current state and Q-values
function chooseAction(state, availablePlans) {
    const epsilon = 0.1; // Exploration-exploitation trade-off
    if (Math.random() < epsilon) {
        // Exploration: choose a random workout plan
        return availablePlans[Math.floor(Math.random() * availablePlans.length)];
    } else {
        // Exploitation: choose the workout plan with the highest Q-value
        return availablePlans.reduce((bestAction, plan) => {
            const qValue = getQValue(state, plan.plan_id);
            return (!bestAction || qValue > getQValue(state, bestAction.plan_id)) ? plan : bestAction;
        }, null);
    }
}
// make above async?

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


async function recommendWorkoutPlansWithRL(userPreferences, workoutPlans, userId) {
    const state = String(userPreferences.fit_goal) + String(userPreferences.exp_level);
    const availablePlans = workoutPlans;//Here or one step back

    // Choose a workout plan (action) based on the current state
    const recommendedPlan = chooseAction(state, availablePlans);

    // Get feedback after the plan is completed
    const feedback = await getUserPlanFeedback(userId, recommendedPlan.plan_id);
    const reward = calculateReward(feedback);
    console.log(`Reward for User ID: ${userId}, Plan ID: ${recommendedPlan.plan_id}: ${reward}`);

    // Construct nextState safely as a string
    // This will likely need to be adjusted to make more meaningful state names


    const performanceMetrics = await getPerformanceMetrics(recommendedPlan.userId);
    // const nextState = String(state) + String(feedback.rating);  // Ensure nextState is always a string
    const nextState = determineNextState(state, feedback, performanceMetrics, userPreferences);

    console.log(`Constructed Next State: ${nextState}`);
    console.log(`State: ${state}, Next State: ${nextState}, Feedback Rating: ${feedback.rating}`);

    // Update Q-value based on feedback and new state
    await updateQValue(userId, state, recommendedPlan.plan_id, reward, nextState);

    return recommendedPlan;
}
async function getAllMuscles() {
    let sql = "SELECT * FROM muscle;";
    return await db.all(sql);
}
//if the user has a mild injury the we should likely pick a lighter weight
async function filterInjuries(workoutPlans, userID) {
    //get the users injuries
    //get the workouts that hit these
    //the above can be two sql statements that will be filtered by a join
    //filter
}
async function getUser(user_id) {
    let sql = `SELECT u.user_id,u.fname,u.lname,u.username,u.email,u.fit_goal,u.exp_level,u.created_at,ui.muscle_id,m.muscle_name,m.muscle_position, ui.injury_intensity
   FROM users u
       LEFT JOIN user_injury  ui ON ui.user_id = u.user_id
       LEFT JOIN muscle m ON ui.muscle_id = m.muscle_id
       WHERE u.user_id = ?
    ;`;
    return await db.all(sql, [user_id]);
}



async function getPerformanceMetrics(user_id) {
    const query = `
    SELECT u.user_id,u.fname,u.lname,wpr.perf_id,e.exercise_name, wpr.actual_sets,wpr.actual_reps,wpr.actual_weight,wpr.perf_date
    FROM users u
    JOIN workout_plans wpl ON wpl.user_id = u.user_id
    JOIN workouts w ON w.plan_id = wpl.plan_id
    JOIN exercises e ON e.workout_id = w.workout_id
    JOIN workout_performance wpr ON wpr.exercise_id = e.exercise_id
    WHERE wpl.user_id = ?
;`;
    /*
    const query = `
        SELECT plan_sets, plan_reps, plan_weight, rest_time
        FROM exercises
        WHERE workout_id IN (
            SELECT workout_id
            FROM workouts
            WHERE plan_id = ?
        );
    `;
    */
    return await db.all(query, [user_id]);
}



module.exports = {
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
};