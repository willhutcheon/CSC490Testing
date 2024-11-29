
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

async function getLogin(username) {
    let sql = "SELECT username, password FROM users WHERE username = ?;";
    return await db.get(sql);
}





async function getWorkoutPlanDetails(planId) {
    console.log("getWorkoutPlanDetails called");
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
        const results = await db.all(sql, [planId]);

        // ADDED, REMOVE?
        /* results.forEach(result => {
            const planId = result.plan_id;
        }); */

        //const planId = results[0].plan_id;

        //const planId = results.length > 0 ? results[0].plan_id : null;
        console.log('planId in SQL:', planId);



        // Group workouts and exercises by workout_id
        const workoutPlans = results.reduce((acc, row) => {
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

            return acc;
        }, []);

        // Return the structured response
        return { status: "success", workoutPlans };
    } catch (error) {
        console.error("Error fetching workout plan details:", error);
        return { status: "error", message: "Error fetching workout plan details" };
    }
}
/* async function getWorkoutPlanDetails(planId) {
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
        const rows = await db.all(sql, [planId]);

        console.log('Raw SQL Result Rows:', rows);

        const plans = {};  // Object to group plan details

        rows.forEach(row => {
            const planId = row.plan_id;  // Store plan_id in planId variable

            // Create a new plan if it doesn’t already exist in `plans`
            if (!plans[planId]) {
                plans[planId] = {
                    plan_id: planId,
                    start_date: row.start_date,
                    end_date: row.end_date,
                    active: row.active,
                    workouts: []
                };
            }

            // Find or create the workout within the plan's workouts array
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

            // Add exercise details to the workout's exercises array
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

        // Return the structured response
        return { status: "success", workoutPlans: Object.values(plans) };
    } catch (error) {
        console.error("Error fetching workout plan details:", error);
        return { status: "error", message: "Error fetching workout plan details" };
    }
} */







async function getWorkoutPlans(userId) {
    // USE, WILLS ORIGINAL
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

    const rows = await db.all(sql, [userId]);

    //console.log('Raw SQL Result Rows:', rows);

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
/* async function getUserPlanFeedback(userId, planId) {
    const sql = `
        SELECT rating, total_calories_burned 
        FROM user_plan_feedback 
        WHERE user_id = ? AND plan_id = ?;
    `;

    const feedback = await db.get(sql, [userId, planId]);
    console.log("Feedback in getUserPlanFeedback1:", feedback);

    return await db.get(sql, [userId, planId]);
} */



// Fetch user feedback for a workout plan
// KEEP, WORKS
async function getUserPlanFeedback(userId, planId) {
    if (typeof userId !== 'number' || typeof planId !== 'number') {
        console.error("Invalid userId or planId type:", { userId, planId });
        return null;  // Handle error or return empty/null if invalid
    }
    const sql = `
        SELECT rating, total_calories_burned 
        FROM user_plan_feedback 
        WHERE user_id = ? AND plan_id = ?;
    `;

    const feedback = await db.get(sql, [userId, planId]);
    console.log("Feedback in getUserPlanFeedback:", feedback);

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


// ADDED
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
/* async function getQValue(userId, state, action) {
    const sql = `
        SELECT q_value
        FROM q_values
        WHERE user_id = ? AND state = ? AND action = ?;
    `;
    const result = await db.get(sql, [userId, state, action]);
    return result ? result.q_value : 0; // Return the Q-value if found, otherwise return 0
} */
async function getQValue(userId, state, action) {
    if (typeof userId !== 'number' || typeof state !== 'string' || typeof action !== 'number') {
        console.error("Invalid parameter types:", { userId, state, action });
        return 0;
    }
    const sql = `
        SELECT q_value
        FROM q_values
        WHERE user_id = ? AND state = ? AND action = ?;
    `;
    console.log(`Inputs - userId: ${userId}, state: ${state}, action: ${action}`);
    const result = await db.get(sql, [userId, state, action]);
    console.log(`SQL in getQvalue: ${result}`);
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
// BELLMAN EQUATION
async function updateQValue(userId, state, action, reward, nextState) {
    console.log("updateQValue called");
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



// FINAL (OG)
/* async function chooseAction(userId, state) {
    if (typeof userId !== 'number' || typeof state !== 'string') {
        console.error("Invalid parameter types:", { userId, state });
        return null;
    }

    const sql = `
        SELECT action, q_value
        FROM q_values
        WHERE user_id = ? AND state = ?;
    `;

    try {
        const actions = await db.all(sql, [userId, state]); // Retrieve all actions for the state

        if (!actions || actions.length === 0) {
            console.log("No actions found for this user and state.");
            return null;
        }        

        // Find the action with the highest Q-value
        let bestAction = actions[0];
        for (const action of actions) {
            if (action.q_value > bestAction.q_value) {
                bestAction = action;
            }
        }

        console.log(`Selected action: ${bestAction.action} with Q-value: ${bestAction.q_value}`);

        // Fetch the full workout plan details using the selected action (plan_id)
        const planSql = `
            SELECT * 
            FROM workout_plans 
            WHERE plan_id = ?;
        `;

        const plan = await db.get(planSql, [bestAction.action]); // Fetch the full plan based on plan_id

        if (!plan) {
            console.log("No plan found for plan_id:", bestAction.action);
            return null;
        }

        console.log("Fetched full workout plan:", plan);
        return plan; // Return the full workout plan object
    } catch (error) {
        console.error("Error in chooseAction:", error);
        return null;
    }
} */
// EXPLORATION EXPLOITATION (WORKS)
/* async function chooseAction(userId, state) {
    if (typeof userId !== 'number' || typeof state !== 'string') {
        console.error("Invalid parameter types:", { userId, state });
        return null;
    }
    
    const sql = `
        SELECT action, q_value
        FROM q_values
        WHERE user_id = ? AND state = ?;
    `;
    
    try {
        const actions = await db.all(sql, [userId, state]); // Retrieve all actions for the state
    
        if (!actions || actions.length === 0) {
            console.log("No actions found for this user and state.");
            return null;
        }
    
        const epsilon = 0.1; // Exploration rate (10% chance to explore)
    
        let selectedAction;
    
        if (Math.random() < epsilon) {
            // Explore: Choose a random action
            const randomIndex = Math.floor(Math.random() * actions.length);
            selectedAction = actions[randomIndex];
            console.log("Exploring: Chose random action:", selectedAction.action);
        } else {
            // Exploit: Choose the action with the highest Q-value
            selectedAction = actions.reduce((best, action) =>
                action.q_value > best.q_value ? action : best
            );
            console.log("Exploiting: Chose best action:", selectedAction.action);
        }
    
        // Fetch the full workout plan details using the selected action (plan_id)
        const planSql = `
            SELECT * 
            FROM workout_plans 
            WHERE plan_id = ?;
        `;
    
        const plan = await db.get(planSql, [selectedAction.action]); // Fetch the full plan based on plan_id
    
        if (!plan) {
            console.log("No plan found for plan_id:", selectedAction.action);
            return null;
        }
    
        console.log("Fetched full workout plan:", plan);
        return plan; // Return the full workout plan object
    } catch (error) {
        console.error("Error in chooseAction:", error);
        return null;
    }
} */
// DECAYING EPSILON (MIGHT USE?)
let epsilon = 1.0; // Initial exploration rate
const epsilonMin = 0.01; // Minimum exploration rate
const epsilonDecay = 0.995; // Decay factor for exponential decay
    
async function chooseAction(userId, state, iteration) {
    if (typeof userId !== 'number' || typeof state !== 'string') {
        console.error("Invalid parameter types:", { userId, state });
        return null;
    }
    
    const sql = `
        SELECT action, q_value
        FROM q_values
        WHERE user_id = ? AND state = ?;
    `;
    
    try {
        const actions = await db.all(sql, [userId, state]); // Retrieve all actions for the state
    
        if (!actions || actions.length === 0) {
            console.log("No actions found for this user and state.");
            return null;
        }
    
        // Decay epsilon after each iteration or episode
        epsilon = Math.max(epsilonMin, epsilon * epsilonDecay); // Exponential decay
        console.log(`Current epsilon (exploration rate): ${epsilon}`);
    
        let selectedAction;
    
        if (Math.random() < epsilon) {
            // Explore: Choose a random action
            const randomIndex = Math.floor(Math.random() * actions.length);
            selectedAction = actions[randomIndex];
            console.log("Exploring: Chose random action:", selectedAction.action);
        } else {
            // Exploit: Choose the action with the highest Q-value
            selectedAction = actions.reduce((best, action) =>
                action.q_value > best.q_value ? action : best
            );
            console.log("Exploiting: Chose best action:", selectedAction.action);
        }
    
        // Fetch the full workout plan details using the selected action (plan_id)
        const planSql = `
            SELECT * 
            FROM workout_plans 
            WHERE plan_id = ?;
        `;
    
        const plan = await db.get(planSql, [selectedAction.action]); // Fetch the full plan based on plan_id
    
        if (!plan) {
            console.log("No plan found for plan_id:", selectedAction.action);
            return null;
        }
    
        console.log("Fetched full workout plan:", plan);
        return plan; // Return the full workout plan object
    } catch (error) {
        console.error("Error in chooseAction:", error);
        return null;
    }
}
    
    





// KEEP
/* async function chooseAction(userId, state) {
    if (typeof userId !== 'number' || typeof state !== 'string') {
        console.error("Invalid parameter types:", { userId, state });
        return null;
    }

    const sql = `
        SELECT action, q_value
        FROM q_values
        WHERE user_id = ? AND state = ?;
    `;

    try {
        const actions = await db.all(sql, [userId, state]); // Retrieve all actions for the state

        if (!actions || actions.length === 0) {
            console.log("No actions found for this user and state.");
            return null;
        }

        // Find the action with the highest Q-value
        let bestAction = actions[0];
        for (const action of actions) {
            if (action.q_value > bestAction.q_value) {
                bestAction = action;
            }
        }

        console.log(`Selected action: ${bestAction.action} with Q-value: ${bestAction.q_value}`);
        return bestAction.action; // Return the action with the highest Q-value
    } catch (error) {
        console.error("Error in chooseAction:", error);
        return null;
    }
} */







/* async function chooseAction(userId, state, availablePlans) {
    const epsilon = 0.1; // Exploration-exploitation trade-off
  
    // Validate inputs
    if (!userId || typeof userId !== 'number' || !state || typeof state !== 'string' || !availablePlans || !Array.isArray(availablePlans) || availablePlans.length === 0) {
      console.error('Invalid inputs to chooseAction:', { userId, state, availablePlansLength: availablePlans?.length });
      throw new Error('Invalid inputs to chooseAction');
    }
  
    // Fetch and log Q-values for available plans
    const planQValues = await Promise.all(
      availablePlans.map(async (plan) => ({
        plan,
        qValue: await getQValue(userId, state, plan.plan_id)
      }))
    );
  
    planQValues.forEach(({ plan, qValue }) => {
      console.log(`Available Plan ID: ${plan.plan_id}, Q-Value: ${qValue}`);
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
      }, null);
  
      if (bestPlanData) {
        console.log(`Exploiting: Selected plan ${bestPlanData.plan.plan_id} with Q-value ${bestPlanData.qValue}`);
        return bestPlanData.plan;
      } else {
        console.log("No available plans to choose from.");
        return null;
      }
    }
  } */

// NO DETERMINE NEXT STATE
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
            const bestAction = await bestActionPromise;
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
// MIGHT WORK?
/* async function chooseAction(state, availablePlans) {
    const epsilon = 0.1; // Exploration-exploitation trade-off

    // Fetch and log Q-values for available plans
    const planQValues = await Promise.all(
        availablePlans.map(async (plan) => ({
            plan,
            qValue: await getQValue(state, plan.plan_id)
        }))
    );

    planQValues.forEach(({ plan, qValue }) => {
        console.log(`Available Plan ID: ${plan.plan_id}, Q-Value: ${qValue}`);
    });

    if (Math.random() < epsilon) {
        // Exploration: choose a random workout plan
        const randomPlan = availablePlans[Math.floor(Math.random() * availablePlans.length)];
        console.log(`Choosing random plan: ${randomPlan.plan_id}`);
        return randomPlan;
    } else {
        // Exploitation: choose the workout plan with the highest Q-value
        const bestPlan = planQValues.reduce((bestAction, { plan, qValue }) => {
            return (!bestAction || qValue > bestAction.qValue) ? { plan, qValue } : bestAction;
        }, null);

        if (bestPlan) {
            console.log(`Best Plan ID: ${bestPlan.plan.plan_id}, Best Q-Value: ${bestPlan.qValue}`);
        } else {
            console.log("No available plans to choose from.");
        }

        return bestPlan?.plan;
    }
} */
// KEEP THIS
// Choose the best workout plan (action) based on current state and Q-values
/* function chooseAction(state, availablePlans) {
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
} */









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


// NO DETERMINE NEXT STATE
async function recommendWorkoutPlansWithRL(userPreferences, workoutPlans, userId) {
    const state = String(userPreferences.fit_goal) + String(userPreferences.exp_level);
    const availablePlans = workoutPlans;

    // Choose a workout plan (action) based on the current state
    //const recommendedPlan = await chooseAction(state, availablePlans);
    const recommendedPlan = await chooseAction(userId, state);
    if (!recommendedPlan || !recommendedPlan.plan_id) {
        console.log("Invalid recommendedPlan:", recommendedPlan);
        return { error: "No valid plan recommended." };
    }

    console.log("Feedback in recommendWorkoutPlansWithRL:");
    // Get feedback after the plan is completed
    const feedback = await getUserPlanFeedback(userId, recommendedPlan.plan_id);
    //const feedback = await getUserPlanFeedback(userId, recommendedPlan);


    console.log("Feedback:", feedback); // Log the feedback to see if it's undefined or missing properties
    const reward = calculateReward(feedback);
    console.log(`Reward for User ID: ${userId}, Plan ID: ${recommendedPlan.plan_id}: ${reward}`);
    //console.log(`Reward for User ID: ${userId}, Plan ID: ${recommendedPlan}: ${reward}`);


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

    // Update Q-value based on feedback and new state

    // REMOVED FOR TESTING, SOLVES AUTO FEEDBACK SUBMISSION ON REFRESH BUG
    //await updateQValue(userId, state, recommendedPlan.plan_id, reward, nextState);

    //await updateQValue(userId, state, recommendedPlan, reward, nextState);


    //return recommendedPlan;
    const workoutPlan = await getWorkoutPlanDetails(recommendedPlan.plan_id);
    return workoutPlan;
}
/* async function recommendWorkoutPlansWithRL(userPreferences, workoutPlans, userId) {
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
} */
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

async function getWorkoutPerformance(userId) {
    const sql = `
        SELECT e.exercise_name, e.plan_reps, wp.actual_reps, e.plan_sets,wp.actual_sets,e.plan_weight,wp.actual_weight
    FROM workout_performance wp
        JOIN exercises e ON wp.exercise_id = e.exercise_id
        JOIN workouts w ON w.workout_id = e.workout_id
        JOIN workout_plans ww ON ww.plan_id = w.plan_id
        JOIN users u ON u.user_id = ww.user_id
    WHERE u.user_id = ?;
    `;
    return await db.get(sql, [userId]);
}

// COLLIN ADDED
async function getUserHistory(user_id){
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
    //workoutExercises,
    getPerformanceMetrics,
    getLogin,
    getWorkoutPerformance,

    // ADDED
    updateUserState,

    getWorkoutPlanDetails,

    // COLLIN ADDED
    getUserHistory
};