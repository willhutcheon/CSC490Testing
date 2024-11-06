
// "use strict";
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
/* async function getWorkoutPlans(userId) {
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

    const rows = await db.all(sql, [userId]) || [];

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

        // Find or create the workout object within the plan's workouts array
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

        // Add the exercise to the workout's exercises array
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
} */



async function getWorkoutPlans(userId) {
    const sql = `
    SELECT wp.plan_id, wp.start_date, wp.end_date, wp.active, 
           w.workout_id, e.exercise_id, e.api_id, e.plan_sets, 
           e.plan_reps, e.plan_weight, e.rest_time, 
           e.exercise_name, e.duration, w.intensity
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


// KEEP THIS
// Choose the best workout plan (action) based on current state and Q-values
function chooseAction(state, availablePlans) {
    const epsilon = 0.1; // Exploration-exploitation trade-off

    availablePlans.forEach(plan => {
        console.log(`Available Plan ID: ${plan.plan_id}, Q-Value: ${getQValue(state, plan.plan_id)}`);
    });

    if (Math.random() < epsilon) {
        // Exploration: choose a random workout plan
        return availablePlans[Math.floor(Math.random() * availablePlans.length)];
    } else {

        // Exploitation: choose the workout plan with the highest Q-value
        return availablePlans.reduce((bestAction, plan) => {
            // const qValue = getQValue(state, plan.plan_id);
            // ADDED
            const qValue = getQValue(state, plan.plan_id);

            console.log(`Current Q value: ${qValue}`);


            return (!bestAction || qValue > getQValue(state, bestAction.plan_id)) ? plan : bestAction;
        }, null);
    }
}

// USE?
/* async function chooseAction(state, availablePlans) {
    const epsilon = 0.1; // Exploration-exploitation trade-off
    
    // Validate inputs
    if (!state || !availablePlans || !Array.isArray(availablePlans) || availablePlans.length === 0) {
        console.error('Invalid inputs to chooseAction:', { state, availablePlansLength: availablePlans?.length });
        throw new Error('Invalid inputs to chooseAction');
    }

    // Log available plans for debugging
    console.log(`Choosing action for state: ${state}`);
    console.log(`Number of available plans: ${availablePlans.length}`);

    try {
        // First, get all Q-values for available plans
        const planQValues = await Promise.all(
            availablePlans.map(async (plan) => ({
                plan,
                qValue: await getQValue(state, plan.plan_id)
            }))
        );

        // Log Q-values for debugging
        planQValues.forEach(({ plan, qValue }) => {
            console.log(`Plan ${plan.plan_id} Q-value: ${qValue}`);
        });

        if (Math.random() < epsilon) {
            // Exploration: choose a random workout plan
            const randomPlan = availablePlans[Math.floor(Math.random() * availablePlans.length)];
            console.log(`Exploring: Randomly selected plan ${randomPlan.plan_id}`);
            return randomPlan;
        } else {
            // Exploitation: choose the plan with highest Q-value
            const bestPlanData = planQValues.reduce((best, current) => {
                return (current.qValue > best.qValue) ? current : best;
            });

            console.log(`Exploiting: Selected plan ${bestPlanData.plan.plan_id} with Q-value ${bestPlanData.qValue}`);
            return bestPlanData.plan;
        }
    } catch (error) {
        console.error('Error in chooseAction:', error);
        throw error;
    }
} */

/* async function chooseAction(state, availablePlans) {
    const epsilon = 0.1; // Exploration-exploitation trade-off

    // Log available plans and their Q-values
    for (const plan of availablePlans) {
        const qValue = await getQValue(state, plan.plan_id); // Await the Q-value
        console.log(`Available Plan ID: ${plan.plan_id}, Q-Value: ${qValue}`);
    }

    if (Math.random() < epsilon) {
        // Exploration: choose a random workout plan
        const randomPlan = availablePlans[Math.floor(Math.random() * availablePlans.length)];
        console.log(`Choosing random plan: ${randomPlan.plan_id}`);
        return randomPlan;
    } else {
        // Exploitation: choose the workout plan with the highest Q-value
        const bestPlan = await availablePlans.reduce(async (bestActionPromise, plan) => {
            const bestAction = await bestActionPromise; // Resolve the best action promise
            const qValue = await getQValue(state, plan.plan_id); // Await the Q-value for the current plan

            console.log(`Evaluating Plan ID: ${plan.plan_id}, Q-Value: ${qValue}`);

            // Compare and decide the best plan
            return (!bestAction || qValue > await getQValue(state, bestAction.plan_id)) ? plan : bestAction;
        }, Promise.resolve(null));

        if (bestPlan) {
            const bestQValue = await getQValue(state, bestPlan.plan_id);
            console.log(`Best Plan ID: ${bestPlan.plan_id}, Best Q-Value: ${bestQValue}`);
        } else {
            console.log("No available plans to choose from.");
        }

        return bestPlan;
    }
} */



// make above async?
/* async function chooseAction(state, availablePlans) {
    const epsilon = 0.1; // Exploration-exploitation trade-off

    // Log available plans and their Q-values
    for (const plan of availablePlans) {
        const qValue = await getQValue(state, plan.plan_id);
        console.log(`Available Plan ID: ${plan.plan_id}, Q-Value: ${qValue}`);
    }

    if (Math.random() < epsilon) {
        // Exploration: choose a random workout plan
        const randomPlan = availablePlans[Math.floor(Math.random() * availablePlans.length)];
        console.log(`Choosing random plan: ${randomPlan.plan_id}`);
        return randomPlan;
    } else {
        // Exploitation: choose the workout plan with the highest Q-value
        const bestPlan = await availablePlans.reduce(async (bestActionPromise, plan) => {
            const bestAction = await bestActionPromise; // Resolve the promise

            const qValue = await getQValue(state, plan.plan_id);
            console.log(`Evaluating Plan ID: ${plan.plan_id}, Q-Value: ${qValue}`);

            return (!bestAction || qValue > await getQValue(state, bestAction.plan_id)) ? plan : bestAction;
        }, Promise.resolve(null));

        if (bestPlan) {
            const bestQValue = await getQValue(state, bestPlan.plan_id);
            console.log(`Best Plan ID: ${bestPlan.plan_id}, Best Q-Value: ${bestQValue}`);
        } else {
            console.log("No available plans to choose from.");
        }

        return bestPlan;
    }
} */




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


    const performanceMetrics = await getPerformanceMetrics(recommendedPlan.plan_id);
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
    let sql = `SELECT u.user_id,u.fname,u.lname,u.username,u.password,u.email,u.fit_goal,u.exp_level,u.created_at,ui.muscle_id,m.muscle_name,m.muscle_position, ui.injury_intensity
   FROM users u
       LEFT JOIN user_injury  ui ON ui.user_id = u.user_id
       LEFT JOIN muscle m ON ui.muscle_id = m.muscle_id
       WHERE u.user_id = ?
    ;`;
    return await db.all(sql, [user_id]);
}


/* async function workoutExercises() {

    let sql =
        `SELECT w.workout_id AS workout_id, w.plan_id AS plan_id, w.intensity, e.exercise_id, e.workout_id, e.plan_sets, e.plan_reps, e.plan_weight,e.exercise_name 
           FROM workouts w 
           LEFT JOIN exercises e ON w.workout_id = e.workout_id;`;

    const rows = await db.get(sql);
    //New JSON code from here
    //const workout = await model.workoutExercises();
    const workouts = rows.reduce((acc, row) => {
        const { workout_id, plan_id, intensity } = row;
        const exercise = {
            exercise_name: row.exercise_name,
            exercise_id: row.exercise_id,
            workout_id: row.workout_id,
            Plan_sets: row.plan_sets,
            Plan_reps: row.plan_reps,
            Plan_weight: row.paln_weight,
            rest: row.rest_time,
            //duration: row.duration
        };
        const existingWorkout = acc.find(workout => workout.workout_id === workout_id && workout.plan_id === plan_id);
        if (existingWorkout) {
            existingWorkout.exercises.push(exercise);
        } else {
            acc.push({
                workout_id,
                plan_id: plan_id,
                intensity,
                exercises: [exercise]
            });
        }

        return acc;

    }, []);

    return workouts;
    //res.json(workouts);
    // To here, uncomment about to check but you will have to comment the other res.json
    //If its not a simple fix lmk and ill change
} */


async function getPerformanceMetrics(planId) {
    const query = `
        SELECT plan_sets, plan_reps, plan_weight, rest_time
        FROM exercises
        WHERE workout_id IN (
            SELECT workout_id
            FROM workouts
            WHERE plan_id = ?
        );
    `;
    return await db.all(query, [planId]);
}


// ADDED
async function updateUserState(userId, fitGoal, expLevel) {
    const query = `UPDATE users SET fit_goal = ?, exp_level = ? WHERE user_id = ?`;
    const params = [fitGoal, expLevel, userId];
    return await db.run(query, params);
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
    //workoutExercises,
    getPerformanceMetrics,

    // ADDED
    updateUserState
};
