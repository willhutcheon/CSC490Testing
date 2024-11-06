--
-- File generated with SQLiteStudio v3.4.4 on Mon Nov 4 16:21:54 2024
--
-- Text encoding used: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: exercises
CREATE TABLE IF NOT EXISTS exercises (
    exercise_id   INT           NOT NULL
                                UNIQUE,
    workout_id    INT           NOT NULL,
    api_id        INT           NOT NULL,
    plan_sets     INT           NOT NULL,
    plan_reps     INT           NOT NULL,
    plan_weight   DECIMAL       NOT NULL,
    rest_time     INT           NOT NULL,
    exercise_name VARCHAR (255) NOT NULL
                                DEFAULT 'Unknown',
    duration     INT           NOT NULL,

    PRIMARY KEY (
        exercise_id
    ),
    FOREIGN KEY (
        workout_id
    )
    REFERENCES workouts (workout_id) ON DELETE CASCADE
);

INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          1,
                          1,
                          101,
                          4,
                          10,
                          100,
                          120,
                          'Squat',
                            10
                      );

INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          2,
                          1,
                          102,
                          3,
                          12,
                          75,
                          90,
                          'Bench Press',
                            5
                      );

INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          3,
                          3,
                          103,
                          1,
                          0,
                          0,
                          0,
                          'Running',
                            30
                      );

INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          4,
                          4,
                          104,
                          1,
                          0,
                          0,
                          0,
                          'Treadmill',
                            60
                      );

INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          5,
                          6,
                          105,
                          3,
                          15,
                          0,
                          60,
                          'Stationary Bike',
                            60
                      );

INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          6,
                          7,
                          106,
                          5,
                          5,
                          200,
                          180,
                          'Deadlift',
                            5
                      );


INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          7,
                          7,
                          107,
                          4,
                          4,
                          40,
                          50,
                          'Hammer Curl',
                            15
                      );

INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          8,
                          7,
                          108,
                          6,
                          8,
                          10,
                          60,
                          'Bicep Curl',
                            15
                      );

INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          9,
                          8,
                          109,
                          1,
                          0,
                          0,
                          0,
                          'Cycling',
                            60
                      );

INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          10,
                          13,
                          110,
                          3,
                          10,
                          25,
                          60,
                          'Concentration Curl',
                            15
                      );

INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          11,
                          7,
                          111,
                          5,
                          10,
                          100,
                          20,
                          'Row',
                            15
                      );

INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          15,
                          16,
                          201,
                          5,
                          10,
                          100,
                          20,
                          'Calf Raises',
                            10
                      );

INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          16,
                          15,
                          202,
                          4,
                          10,
                          100,
                          10,
                          'Squat',
                            10
                      );
INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          12,
                          22,
                          112,
                          5,
                          25,
                          5,
                          20,
                          'Sit-ups',
                            15
                      );
INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          13,
                          22,
                          113,
                          2,
                          10,
                          0,
                          20,
                          'Box Jumps',
                            10
                      );

INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          14,
                          22,
                          114,
                          1,
                          10,
                          0,
                          15,
                          'Pull ups',
                            10
                      );
INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          17,
                          23,
                          115,
                          5,
                          20,
                          0,
                          30,
                          'Push Ups',
                            15
                      );
INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          18,
                          23,
                          116,
                          3,
                          10,
                          20,
                          30,
                          'Tricep Pull Down',
                            15
                      );
INSERT INTO exercises (
                          exercise_id,
                          workout_id,
                          api_id,
                          plan_sets,
                          plan_reps,
                          plan_weight,
                          rest_time,
                          exercise_name,
                            duration
                      )
                      VALUES (
                          19,
                          23,
                          117,
                          3,
                          10,
                          0,
                          15,
                          'Bench Dips',
                            15
                      );

-- Table: feedback
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT NOT NULL
                    UNIQUE,
    exercise_id INT NOT NULL,
    user_id     INT NOT NULL,
    rating      INT NOT NULL,
    PRIMARY KEY (
        feedback_id
    ),
    FOREIGN KEY (
        exercise_id
    )
    REFERENCES exercises (exercise_id) ON DELETE CASCADE,
    FOREIGN KEY (
        user_id
    )
    REFERENCES users (user_id) ON DELETE CASCADE
);


-- Table: muscle
CREATE TABLE IF NOT EXISTS muscle (
    muscle_id       INT          NOT NULL,
    muscle_name     VARCHAR (50) NOT NULL,
    muscle_position TEXT         CHECK (muscle_position IN ('left', 'right') ) 
                                 NOT NULL,-- intensity can be given a number 15, 10, 5
    /* super key */UNIQUE (
        muscle_position,
        muscle_name
    ),
    PRIMARY KEY (
        muscle_id
    )
);

INSERT INTO muscle (
                       muscle_id,
                       muscle_name,
                       muscle_position
                   )
                   VALUES (
                       1,
                       'biceps brachii',
                       'left'
                   );

INSERT INTO muscle (
                       muscle_id,
                       muscle_name,
                       muscle_position
                   )
                   VALUES (
                       2,
                       'biceps brachii',
                       'right'
                   );

INSERT INTO muscle (
                       muscle_id,
                       muscle_name,
                       muscle_position
                   )
                   VALUES (
                       3,
                       'rectus femorus',
                       'left'
                   );

INSERT INTO muscle (
                       muscle_id,
                       muscle_name,
                       muscle_position
                   )
                   VALUES (
                       4,
                       'rectus femorus',
                       'right'
                   );


-- Table: muscle_workout
CREATE TABLE IF NOT EXISTS muscle_workout (
    muscle_id  INT NOT NULL,
    workout_id INT NOT NULL,
    FOREIGN KEY (
        muscle_id
    )
    REFERENCES muscle (muscle_id) ON DELETE CASCADE,
    FOREIGN KEY (
        workout_id
    )
    REFERENCES workout (workout_id) ON DELETE CASCADE
);

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               3,
                               8
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               4,
                               8
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               1,
                               7
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               2,
                               7
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               3,
                               7
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               4,
                               7
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               1,
                               2
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               2,
                               2
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               3,
                               1
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               4,
                               1
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               3,
                               3
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               4,
                               3
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               3,
                               4
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               4,
                               4
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               3,
                               5
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               4,
                               5
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               3,
                               6
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               4,
                               6
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               1,
                               11
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               2,
                               11
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               1,
                               12
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               2,
                               12
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               1,
                               13
                           );

INSERT INTO muscle_workout (
                               muscle_id,
                               workout_id
                           )
                           VALUES (
                               2,
                               13
                           );


-- Table: q_values
CREATE TABLE IF NOT EXISTS q_values (
    user_id INT  NOT NULL,
    state   TEXT NOT NULL,
    action  INT  NOT NULL,
    q_value REAL NOT NULL,
    PRIMARY KEY (-- added user_id
        user_id,
        state,
        action
    )-- removed, works
/* FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE */);

INSERT INTO q_values (
                         user_id,
                         state,
                         action,
                         q_value
                     )
                     VALUES (
                         7572,
                         'Strength-Beginner',
                         1,
                         1.0
                     );

INSERT INTO q_values (
                         user_id,
                         state,
                         action,
                         q_value
                     )
                     VALUES (
                         7572,
                         'Endurance-Advanced',
                         2,
                         0.8
                     );

INSERT INTO q_values (
                         user_id,
                         state,
                         action,
                         q_value
                     )
                     VALUES (
                         9014,
                         'Hypertrophy-Beginner',
                         3,
                         0.9
                     );

INSERT INTO q_values (
                         user_id,
                         state,
                         action,
                         q_value
                     )
                     VALUES (
                         2710,
                         'Strength-Advanced',
                         4,
                         1.2
                     );

INSERT INTO q_values (
                         user_id,
                         state,
                         action,
                         q_value
                     )
                     VALUES (
                         3601,
                         'Endurance-Intermediate',
                         5,
                         1.0
                     );

INSERT INTO q_values (
                         user_id,
                         state,
                         action,
                         q_value
                     )
                     VALUES (
                         3601,
                         'StrengthAdvanced',
                         4,
                         1.99999339883987
                     );

INSERT INTO q_values (
                         user_id,
                         state,
                         action,
                         q_value
                     )
                     VALUES (
                         2710,
                         'HypertrophyBeginner',
                         3,
                         0.75
                     );

INSERT INTO q_values (
                         user_id,
                         state,
                         action,
                         q_value
                     )
                     VALUES (
                         7572,
                         'StrengthBeginner',
                         1,
                         4.206637
                     );

INSERT INTO q_values (
                         user_id,
                         state,
                         action,
                         q_value
                     )
                     VALUES (
                         3601,
                         'CardioBeginner',
                         1,
                         0.0
                     );

INSERT INTO q_values (
                         user_id,
                         state,
                         action,
                         q_value
                     )
                     VALUES (
                         3601,
                         'StrengthAdvanced',
                         6,
                         1.0
                     );


-- Table: user_feedback
CREATE TABLE IF NOT EXISTS user_feedback (
    user_id         INT,
    workout_id      INT,
    rating          INT,
    calories_burned REAL,
    feedback_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (
        user_id,
        workout_id
    ),
    FOREIGN KEY (
        user_id
    )
    REFERENCES users (user_id),
    FOREIGN KEY (
        workout_id
    )
    REFERENCES workouts (workout_id) 
);


-- Table: user_injury
CREATE TABLE IF NOT EXISTS user_injury (
    muscle_id        INT  NOT NULL,
    user_id          INT  NOT NULL,
    injury_intensity TEXT CHECK (injury_intensity IN ('severe', 'moderate', 'mild', 'none') ) 
                          NOT NULL,-- intensity can be given a number 15, 10, 5
    FOREIGN KEY (
        muscle_id
    )
    REFERENCES muscle (muscle_id) ON DELETE CASCADE,
    FOREIGN KEY (
        user_id
    )
    REFERENCES user (user_id) ON DELETE CASCADE
);

INSERT INTO user_injury (
                            muscle_id,
                            user_id,
                            injury_intensity
                        )
                        VALUES (
                            3,
                            9014,
                            'mild'
                        );

INSERT INTO user_injury (
                            muscle_id,
                            user_id,
                            injury_intensity
                        )
                        VALUES (
                            1,
                            2710,
                            'severe'
                        );

INSERT INTO user_injury (
                            muscle_id,
                            user_id,
                            injury_intensity
                        )
                        VALUES (
                            2,
                            2710,
                            'severe'
                        );


-- Table: user_plan_feedback
CREATE TABLE IF NOT EXISTS user_plan_feedback (
    user_id               INT,
    plan_id               INT,
    rating                INT,-- User's rating of the plan
    total_calories_burned REAL,-- Total calories burned over the plan
    feedback_time         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (
        user_id,
        plan_id
    ),
    FOREIGN KEY (
        user_id
    )
    REFERENCES users (user_id),
    FOREIGN KEY (
        plan_id
    )
    REFERENCES workout_plans (plan_id) 
);

INSERT INTO user_plan_feedback (
                                   user_id,
                                   plan_id,
                                   rating,
                                   total_calories_burned,
                                   feedback_time
                               )
                               VALUES (
                                   7572,
                                   1,
                                   5,
                                   500.0,
                                   '2024-10-19 02:46:06'
                               );

INSERT INTO user_plan_feedback (
                                   user_id,
                                   plan_id,
                                   rating,
                                   total_calories_burned,
                                   feedback_time
                               )
                               VALUES (
                                   9014,
                                   2,
                                   4,
                                   300.0,
                                   '2024-10-19 02:46:06'
                               );

INSERT INTO user_plan_feedback (
                                   user_id,
                                   plan_id,
                                   rating,
                                   total_calories_burned,
                                   feedback_time
                               )
                               VALUES (
                                   2710,
                                   3,
                                   3,
                                   450.0,
                                   '2024-10-19 02:46:06'
                               );

INSERT INTO user_plan_feedback (
                                   user_id,
                                   plan_id,
                                   rating,
                                   total_calories_burned,
                                   feedback_time
                               )
                               VALUES (
                                   3601,
                                   4,
                                   1,
                                   100.0,
                                   '2024-10-19 02:46:06'
                               );

INSERT INTO user_plan_feedback (
                                   user_id,
                                   plan_id,
                                   rating,
                                   total_calories_burned,
                                   feedback_time
                               )
                               VALUES (
                                   2624,
                                   5,
                                   4,
                                   500.0,
                                   '2024-10-19 02:46:06'
                               );

INSERT INTO user_plan_feedback (
                                   user_id,
                                   plan_id,
                                   rating,
                                   total_calories_burned,
                                   feedback_time
                               )
                               VALUES (
                                   3601,
                                   6,
                                   5,
                                   500.0,
                                   '2024-10-19 02:46:06'
                               );


-- Table: user_plan_history
CREATE TABLE IF NOT EXISTS user_plan_history (
    user_id      INT,
    plan_id      INT,
    started_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (
        user_id
    )
    REFERENCES users (user_id),
    FOREIGN KEY (
        plan_id
    )
    REFERENCES workout_plans (plan_id) 
);


-- Table: user_preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    preference_id       INT           NOT NULL
                                      UNIQUE,
    user_id             INT           NOT NULL,
    preferred_types     VARCHAR (255),
    preferred_intensity VARCHAR (50),
    preferred_duration  INT,
    preferred_exercise  VARCHAR (255),
    PRIMARY KEY (
        preference_id
    ),
    FOREIGN KEY (
        user_id
    )
    REFERENCES users (user_id) ON DELETE CASCADE
);

INSERT INTO user_preferences (
                                 preference_id,
                                 user_id,
                                 preferred_types,
                                 preferred_intensity,
                                 preferred_duration,
                                 preferred_exercise
                             )
                             VALUES (
                                 1,
                                 7572,
                                 'Weightlifting',
                                 'High',
                                 60,
                                 'Squat'
                             );

INSERT INTO user_preferences (
                                 preference_id,
                                 user_id,
                                 preferred_types,
                                 preferred_intensity,
                                 preferred_duration,
                                 preferred_exercise
                             )
                             VALUES (
                                 2,
                                 9014,
                                 'Running',
                                 'Low',
                                 30,
                                 'Treadmill'
                             );

INSERT INTO user_preferences (
                                 preference_id,
                                 user_id,
                                 preferred_types,
                                 preferred_intensity,
                                 preferred_duration,
                                 preferred_exercise
                             )
                             VALUES (
                                 3,
                                 2710,
                                 'Bodybuilding',
                                 'Medium',
                                 45,
                                 'Bench Press'
                             );

INSERT INTO user_preferences (
                                 preference_id,
                                 user_id,
                                 preferred_types,
                                 preferred_intensity,
                                 preferred_duration,
                                 preferred_exercise
                             )
                             VALUES (
                                 4,
                                 3601,
                                 'Powerlifting',
                                 'High',
                                 90,
                                 'Deadlift'
                             );

INSERT INTO user_preferences (
                                 preference_id,
                                 user_id,
                                 preferred_types,
                                 preferred_intensity,
                                 preferred_duration,
                                 preferred_exercise
                             )
                             VALUES (
                                 5,
                                 2624,
                                 'Cycling',
                                 'Medium',
                                 45,
                                 'Stationary Bike'
                             );


-- Table: users
CREATE TABLE IF NOT EXISTS users (
    user_id    INT           NOT NULL
                             UNIQUE,
    fname      VARCHAR (50)  NOT NULL,
    lname      VARCHAR (50)  NOT NULL,
    username   VARCHAR (50)  NOT NULL,
    password    VARCHAR(50) NOT NULL UNIQUE,
    email      VARCHAR (255) NOT NULL,
    fit_goal   VARCHAR (255) NOT NULL,
    exp_level  VARCHAR (50)  NOT NULL,
    created_at DATETIME      NOT NULL,
    PRIMARY KEY (
        user_id
    )
);

INSERT INTO users (
                      user_id,
                      fname,
                      lname,
                      username,
                        password,
                      email,
                      fit_goal,
                      exp_level,
                      created_at
                  )
                  VALUES (
                      7572,
                      'Ursa',
                      'Moses',
                      'User1',
                        'User1',
                      'vulputate.dui.nec@icloud.ca',
                      'Strength',
                      'Beginner',
                      '2025-01-09 01:16:10'
                  );

INSERT INTO users (
                      user_id,
                      fname,
                      lname,
                      username,
                        password,
                      email,
                      fit_goal,
                      exp_level,
                      created_at
                  )
                  VALUES (
                      9014,
                      'Nora',
                      'Anthony',
                      'User2',
                        'User2',
                      'nunc.sed@aol.com',
                      'Endurance',
                      'Advanced',
                      '2024-11-09 01:16:10'
                  );

INSERT INTO users (
                      user_id,
                      fname,
                      lname,
                      username,
                        password,
                      email,
                      fit_goal,
                      exp_level,
                      created_at
                  )
                  VALUES (
                      2710,
                      'Lucius',
                      'Puckett',
                      'User3',
                        'User3',
                      'cras.sed@yahoo.net',
                      'Hypertrophy',
                      'Beginner',
                      '2015-01-09 01:16:10'
                  );

INSERT INTO users (
                      user_id,
                      fname,
                      lname,
                      username,
                        password,
                      email,
                      fit_goal,
                      exp_level,
                      created_at
                  )
                  VALUES (
                      3601,
                      'Connor',
                      'Hurst',
                      'User4',
                        'User4',
                      'vel.arcu@aol.net',
                      'Strength',
                      'Advanced',
                      '2024-01-09 01:16:10'
                  );

INSERT INTO users (
                      user_id,
                      fname,
                      lname,
                      username,
                        password,
                      email,
                      fit_goal,
                      exp_level,
                      created_at
                  )
                  VALUES (
                      2624,
                      'Lila',
                      'Jacobson',
                      'User5',
                        'User5',
                      'egestas.urna@icloud.net',
                      'Endurance',
                      'intermediate',
                      '2020-01-09 01:16:10'
                  );


-- Table: workout_performance
CREATE TABLE IF NOT EXISTS workout_performance (
    perf_id       INT      NOT NULL,
    exercise_id   INT      NOT NULL,
    actual_sets   INT      NOT NULL,
    actual_reps   INT      NOT NULL,
    actual_weight DECIMAL  NOT NULL,
    perf_date     DATETIME NOT NULL,
    PRIMARY KEY (
        perf_id
    ),
    FOREIGN KEY (
        exercise_id
    )
    REFERENCES exercises (exercise_id) ON DELETE CASCADE
);
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   1,
                                   1,
                                   4,
                                   10,
                                    0,
                                   '2024-10-19 02:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   2,
                                   2,
                                   3,
                                   12,
                                    90,
                                   '2024-09-16 01:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   3,
                                   3,
                                   1,
                                   0,
                                    0,
                                   '2023-08-17 03:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   4,
                                   4,
                                   1,
                                   0,
                                    0,
                                   '2022-07-19 04:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   5,
                                   5,
                                   2,
                                   10,
                                    0,
                                   '2021-11-19 05:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   6,
                                   6,
                                   4,
                                   5,
                                    180,
                                   '2020-12-25 06:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   7,
                                   7,
                                   3,
                                   4,
                                    40,
                                   '2023-02-11 07:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   8,
                                   8,
                                   5,
                                   5,
                                    8,
                                   '2024-03-22 02:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   9,
                                   9,
                                   1,
                                   0,
                                    0,
                                   '2022-07-19 02:47:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   10,
                                   10,
                                   3,
                                   10,
                                    25,
                                   '2024-08-10 02:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   11,
                                   11,
                                   5,
                                   10,
                                    75,
                                   '2023-09-19 03:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   12,
                                   15,
                                   5,
                                   10,
                                    50,
                                   '2021-10-19 02:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   13,
                                   16,
                                   3,
                                   10,
                                    100,
                                   '2024-10-19 05:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   14,
                                   12,
                                   5,
                                   20,
                                    5,
                                   '2023-10-19 06:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   15,
                                   13,
                                   2,
                                   5,
                                    0,
                                   '2021-10-19 02:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   16,
                                   14,
                                   1,
                                   10,
                                    0,
                                   '2022-10-19 01:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   17,
                                   17,
                                   5,
                                   25,
                                    0,
                                   '2023-10-19 02:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   18,
                                   18,
                                   4,
                                   10,
                                    20,
                                   '2021-10-19 02:46:06'
                               );
INSERT INTO workout_performance (
                                   perf_id,
                                   exercise_id,
                                   actual_sets,
                                   actual_reps,
                                   actual_weight,
                                    perf_date
                               )
                               VALUES (
                                   19,
                                   19,
                                   3,
                                   10,
                                    5,
                                   '2022-10-19 02:46:06'
                               );


-- Table: workout_plans
CREATE TABLE IF NOT EXISTS workout_plans (
    plan_id    INT  NOT NULL
                    UNIQUE,
    user_id    INT  NOT NULL,
    start_date DATE NOT NULL,
    end_date   DATE NOT NULL,
    active     BOOL NOT NULL,
    PRIMARY KEY (
        plan_id
    ),
    FOREIGN KEY (
        user_id
    )
    REFERENCES users (user_id) ON DELETE CASCADE
);

INSERT INTO workout_plans (
                              plan_id,
                              user_id,
                              start_date,
                              end_date,
                              active
                          )
                          VALUES (
                              1,
                              7572,
                              '2024-01-01',
                              '2024-01-31',
                              1
                          );

INSERT INTO workout_plans (
                              plan_id,
                              user_id,
                              start_date,
                              end_date,
                              active
                          )
                          VALUES (
                              2,
                              9014,
                              '2024-02-01',
                              '2024-02-28',
                              1
                          );

INSERT INTO workout_plans (
                              plan_id,
                              user_id,
                              start_date,
                              end_date,
                              active
                          )
                          VALUES (
                              3,
                              2710,
                              '2024-03-01',
                              '2024-03-31',
                              1
                          );

INSERT INTO workout_plans (
                              plan_id,
                              user_id,
                              start_date,
                              end_date,
                              active
                          )
                          VALUES (
                              4,
                              3601,
                              '2024-04-01',
                              '2024-04-30',
                              1
                          );

INSERT INTO workout_plans (
                              plan_id,
                              user_id,
                              start_date,
                              end_date,
                              active
                          )
                          VALUES (
                              5,
                              2624,
                              '2024-05-01',
                              '2024-05-31',
                              1
                          );

INSERT INTO workout_plans (
                              plan_id,
                              user_id,
                              start_date,
                              end_date,
                              active
                          )
                          VALUES (
                              6,
                              3601,
                              '2024-05-01',
                              '2024-05-31',
                              1
                          );


-- Table: workouts
CREATE TABLE IF NOT EXISTS workouts (
    workout_id    INT  NOT NULL
                       UNIQUE,
    plan_id       INT  NOT NULL,
    intensity     TEXT NOT NULL,
    PRIMARY KEY (
        workout_id
    ),
    FOREIGN KEY (
        plan_id
    )
    REFERENCES workout_plans (plan_id) ON DELETE CASCADE
);

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         1,
                         1,
                         'High'
    );

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         2,
                         1,
                         'High'
                     );

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         3,
                         2,
                         'Low'
                     );

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         4,
                         2,
                         'Low'
                     );

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         5,
                         3,
                         'Medium'
                     );

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         6,
                         3,
                         'Medium'
                     );

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         7,
                         4,
                         'High'
                     );

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         8,
                         5,
                         'Medium'
                     );

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         11,
                         4,
                         'High'
                     );

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         12,
                         4,
                         'High'
                     );

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         13,
                         3,
                         'Medium'
                     );

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         14,
                         4,
                         'High'
                     );

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         15,
                         6,
                         'High'
                     );

INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         16,
                         6,
                         'High'
                     );
INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         22,
                         4,
                         'Medium'
                     );
INSERT INTO workouts (
                         workout_id,
                         plan_id,
                         intensity
                     )
                     VALUES (
                         23,
                         4,
                         'High'
                     );


COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
