"use strict";
const db = require("../models/db-conn");

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


// Fetch active workout plans for the user, including associated workouts and exercises
//for severe workouts just modify this
async function getWorkoutPlans(userId) {
    /* const sql = `
    SELECT wp.plan_id, wp.start_date, wp.end_date, wp.active, w.*
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
        GROUP BY w.workout_id
        ;
    `; */

    const sql = `
    SELECT wp.plan_id, wp.start_date, wp.end_date, wp.active, w.*, e.exercise_name
        FROM workout_plans wp
            JOIN workouts w ON wp.plan_id = w.plan_id
            JOIN exercises e ON w.workout_id = e.workout_id
            WHERE wp.user_id = ? AND wp.active = true;
;
    `;

    // ADDED, cleaner sql for above?
    // SELECT wp.plan_id, wp.start_date, wp.end_date, wp.active, 
    // w.workout_id, e.exercise_name, w.intensity, w.duration 
    // FROM workout_plans wp
    // LEFT JOIN workouts w ON wp.plan_id = w.plan_id
    // LEFT JOIN exercises e ON w.workout_id = e.workout_id
    // WHERE wp.user_id = 3601 AND wp.active = true

    //return await db.all(sql, [userId]);

    // ADDED
    const rows = await db.all(sql, [userId]);

    // ADDED
    console.log('Raw SQL Result Rows:', rows);


    const plans = {};
    rows.forEach(row => {
        const planId = row.plan_id;

        // Initialize plan if it doesn't exist
        if (!plans[planId]) {
            plans[planId] = {
                plan_id: planId,
                start_date: row.start_date,
                end_date: row.end_date,
                workouts: []
            };
        }

        // Push workout to the respective plan
        plans[planId].workouts.push({
            workout_id: row.workout_id,
            intensity: row.intensity
        });
    });


    // ADDED
    console.log('Structured Plans Object:', plans);


    // Convert plans object back to an array
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
                   w.workout_id, w.intensity
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


// Update Q-value based on feedback
/* function updateQValue(state, action, reward, nextState) {
    const learningRate = 0.1;
    const discountFactor = 0.9;
    const currentQ = getQValue(state, action);
    const maxFutureQ = Math.max(...Object.values(QTable[nextState] || {}));
    const newQ = currentQ + learningRate * (reward + discountFactor * maxFutureQ - currentQ);
    if (!QTable[state]) QTable[state] = {};
    QTable[state][action] = newQ;
} */

// ADDED, above works
/* async function updateQValue(userId, state, action, reward, nextState) {
    const learningRate = 0.1;
    const discountFactor = 0.9;
    const currentQ = await getQValue(userId, state, action); // Fetch the current Q-value from the database
    const maxFutureQ = Math.max(...Object.values(QTable[nextState] || {}));
    const newQ = currentQ + learningRate * (reward + discountFactor * maxFutureQ - currentQ);
    // Save the new Q-value to the database
    await upsertQValue(userId, state, action, newQ);
} */
/* async function updateQValue(userId, state, action, reward, nextState) {
    const learningRate = 0.1;
    const discountFactor = 0.9;
    
    const currentQ = await getQValue(userId, state, action) || 0; // Default to 0 if undefined
    console.log(Current Q-value for User ID: ${userId}, State: ${state}, Action: ${action}: ${currentQ});

    const maxFutureQ = Math.max(0, ...Object.values(QTable[nextState] || {})); // Default to 0 if empty
    console.log(Max Future Q-value for State: ${nextState}: ${maxFutureQ});

    // Ensure reward is a valid number
    const validReward = typeof reward === 'number' && !isNaN(reward) ? reward : 0;
    
    const newQ = currentQ + learningRate * (validReward + discountFactor * maxFutureQ - currentQ);
    console.log(New Q-value for User ID: ${userId}, State: ${state}, Action: ${action}: ${newQ});

    console.log(Updating Q-value: User ID: ${userId}, State: ${state}, Action: ${action}, New Q-Value: ${newQ});
    
    // Save the new Q-value to the database
    await upsertQValue(userId, state, action, newQ);
} */

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
// make above async? ex.
/* async function chooseAction(state, availablePlans) {
    const epsilon = 0.1;
    if (Math.random() < epsilon) {
        // Exploration: choose a random workout plan
        return availablePlans[Math.floor(Math.random() * availablePlans.length)];
    } else {
        // Exploitation: choose the workout plan with the highest Q-value
        let bestAction = null;
        let highestQValue = -Infinity;
        for (const plan of availablePlans) {
            const qValue = await getQValue(state, plan.plan_id); // await each Q-value fetch
            if (!bestAction || qValue > highestQValue) {
                bestAction = plan;
                highestQValue = qValue;
            }
        }
        return bestAction;
    }
} */


// Recommend workout plans using reinforcement learning
/* async function recommendWorkoutPlansWithRL(userPreferences, workoutPlans, userId) {
    const state = userPreferences.fit_goal + userPreferences.exp_level; // State representation
    const availablePlans = workoutPlans;

    // Choose a workout plan (action) based on the current state
    const recommendedPlan = chooseAction(state, availablePlans);

    // Get feedback after the plan is completed
    const feedback = await getUserPlanFeedback(userId, recommendedPlan.plan_id);
    const reward = calculateReward(feedback);
    console.log(Reward for User ID: ${userId}, Plan ID: ${recommendedPlan.plan_id}: ${reward});


    // Update Q-value based on feedback and new state
    // const nextState = state;
    // ADDED
    const nextState = state + feedback.rating; // In this case, the state may remain the same
    updateQValue(state, recommendedPlan.plan_id, reward, nextState);

    return recommendedPlan;
} */
async function injuryFilter(userId) {
    const sql = `
        SELECT wp.*
        FROM workout_plans wp
            JOIN workouts w ON wp.plan_id = w.plan_id
            JOIN exercises e ON w.workout_id = e.workout_id
            LEFT JOIN muscle_workout mw ON w.workout_id = mw.workout_id
            LEFT JOIN user_injury ui ON mw.muscle_id = ui.muscle_id
            WHERE wp.user_id = ? AND ( wp.active = true AND ui.injury_intensity <> 'severe')
    `;
    return await db.get(sql, [userId]);
}

async function recommendWorkoutPlansWithRL(userPreferences, workoutPlans, userId) {
    const state = String(userPreferences.fit_goal) + String(userPreferences.exp_level);
    const availablePlans = workoutPlans;//Here or one step back
    //injury filter
    //const availablePlans = injuryFilter(userId);
    // Choose a workout plan (action) based on the current state
    const recommendedPlan = chooseAction(state, availablePlans);

    // Get feedback after the plan is completed
    const feedback = await getUserPlanFeedback(userId, recommendedPlan.plan_id);
    const reward = calculateReward(feedback);
    console.log(`Reward for User ID: ${userId}, Plan ID: ${recommendedPlan.plan_id}: ${reward}`);

    // Construct nextState safely as a string
    // This will likely need to be adjusted to make more meaningful state names
    const nextState = String(state) + String(feedback.rating);  // Ensure nextState is always a string
    console.log(`Constructed Next State: ${nextState}`);
    console.log(`State: ${state}, Next State: ${nextState}, Feedback Rating: ${feedback.rating}`);

    // Update Q-value based on feedback and new state
    await updateQValue(userId, state, recommendedPlan.plan_id, reward, nextState);

    return recommendedPlan;
}
async function getAllMuscles(){
    let sql = "SELECT * FROM muscle;";
    return await db.all(sql);
}
//if the user has a mild injury the we should likely pick a lighter weight
async function filterInjuries(workoutPlans,userID){
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
    getUser
};
