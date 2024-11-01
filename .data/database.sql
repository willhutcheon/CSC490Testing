PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE exercises (
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
    PRIMARY KEY (
        exercise_id
    ),
    FOREIGN KEY (
        workout_id
    )
    REFERENCES workouts (workout_id) ON DELETE CASCADE
);
INSERT INTO exercises VALUES(1,1,101,4,10,100,120,'Squat');
INSERT INTO exercises VALUES(2,1,102,3,12,75,90,'Bench Press');
INSERT INTO exercises VALUES(3,3,103,1,0,0,0,'Running');
INSERT INTO exercises VALUES(4,4,104,1,0,0,0,'Treadmill');
INSERT INTO exercises VALUES(5,6,105,3,15,0,60,'Stationary Bike');
INSERT INTO exercises VALUES(6,7,106,5,5,200,180,'Deadlift');
INSERT INTO exercises VALUES(7,11,107,4,4,40,50,'Hammer Curl');
INSERT INTO exercises VALUES(8,12,108,6,8,10,60,'Bicep Curl');
INSERT INTO exercises VALUES(9,8,109,1,0,0,0,'Cycling');
INSERT INTO exercises VALUES(10,13,110,3,10,25,60,'Concentration Curl');
CREATE TABLE feedback (
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
CREATE TABLE q_values (
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
INSERT INTO q_values VALUES(7572,'Strength-Beginner',1,1.0);
INSERT INTO q_values VALUES(7572,'Endurance-Advanced',2,0.8);
INSERT INTO q_values VALUES(9014,'Hypertrophy-Beginner',3,0.9);
INSERT INTO q_values VALUES(2710,'Strength-Advanced',4,1.1999999999999999644);
INSERT INTO q_values VALUES(3601,'Endurance-Intermediate',5,1.0);
INSERT INTO q_values VALUES(3601,'StrengthAdvanced',4,2.3332153807230318065);
INSERT INTO q_values VALUES(2710,'HypertrophyBeginner',3,2.0325000000000001953);
CREATE TABLE user_feedback (
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
CREATE TABLE user_plan_feedback (
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
INSERT INTO user_plan_feedback VALUES(7572,1,5,800.0,'2024-10-19 02:46:06');
INSERT INTO user_plan_feedback VALUES(9014,2,4,300.0,'2024-10-19 02:46:06');
INSERT INTO user_plan_feedback VALUES(2710,3,3,450.0,'2024-10-19 02:46:06');
INSERT INTO user_plan_feedback VALUES(3601,4,1,100.0,'2024-10-19 02:46:06');
INSERT INTO user_plan_feedback VALUES(2624,5,4,500.0,'2024-10-19 02:46:06');
CREATE TABLE user_plan_history (
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
CREATE TABLE user_preferences (
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
INSERT INTO user_preferences VALUES(1,7572,'Weightlifting','High',60,'Squat');
INSERT INTO user_preferences VALUES(2,9014,'Running','Low',30,'Treadmill');
INSERT INTO user_preferences VALUES(3,2710,'Bodybuilding','Medium',45,'Bench Press');
INSERT INTO user_preferences VALUES(4,3601,'Powerlifting','High',90,'Deadlift');
INSERT INTO user_preferences VALUES(5,2624,'Cycling','Medium',45,'Stationary Bike');
CREATE TABLE users (
    user_id    INT           NOT NULL
                             UNIQUE,
    fname      VARCHAR (50)  NOT NULL,
    lname      VARCHAR (50)  NOT NULL,
    username   VARCHAR (50)  NOT NULL,
    email      VARCHAR (255) NOT NULL,
    fit_goal   VARCHAR (255) NOT NULL,
    exp_level  VARCHAR (50)  NOT NULL,
    created_at DATETIME      NOT NULL,
    PRIMARY KEY (
        user_id
    )
);
INSERT INTO users VALUES(7572,'Ursa','Moses','Joseph F. Dudley','vulputate.dui.nec@icloud.ca','Strength','Beginner','2025-01-09 01:16:10');
INSERT INTO users VALUES(9014,'Nora','Anthony','Nadine L. Harrison','nunc.sed@aol.com','Endurance','Advanced','2024-11-09 01:16:10');
INSERT INTO users VALUES(2710,'Lucius','Puckett','Benedict Y. Meadows','cras.sed@yahoo.net','Hypertrophy','Beginner','2015-01-09 01:16:10');
INSERT INTO users VALUES(3601,'Connor','Hurst','Chaim D. Guy','vel.arcu@aol.net','Strength','Advanced','2024-01-09 01:16:10');
INSERT INTO users VALUES(2624,'Lila','Jacobson','Bryar Y. Richards','egestas.urna@icloud.net','Endurance','intermediate','2020-01-09 01:16:10');
CREATE TABLE workout_performance (
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
CREATE TABLE workout_plans (
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
INSERT INTO workout_plans VALUES(1,7572,'2024-01-01','2024-01-31',1);
INSERT INTO workout_plans VALUES(2,9014,'2024-02-01','2024-02-28',1);
INSERT INTO workout_plans VALUES(3,2710,'2024-03-01','2024-03-31',1);
INSERT INTO workout_plans VALUES(4,3601,'2024-04-01','2024-04-30',1);
INSERT INTO workout_plans VALUES(5,2624,'2024-05-01','2024-05-31',1);
CREATE TABLE workouts (
    workout_id    INT  NOT NULL
                       UNIQUE,
    plan_id       INT  NOT NULL,
    exercise_name TEXT NOT NULL,
    intensity     TEXT NOT NULL,
    duration      INT  NOT NULL,
    PRIMARY KEY (
        workout_id
    ),
    FOREIGN KEY (
        plan_id
    )
    REFERENCES workout_plans (plan_id) ON DELETE CASCADE
);
INSERT INTO workouts VALUES(1,1,'Squat','High',60);
INSERT INTO workouts VALUES(2,1,'Bench Press','High',60);
INSERT INTO workouts VALUES(3,2,'Running','Low',30);
INSERT INTO workouts VALUES(4,2,'Treadmill','Low',30);
INSERT INTO workouts VALUES(5,3,'Cycling','Medium',45);
INSERT INTO workouts VALUES(6,3,'Stationary Bike','Medium',45);
INSERT INTO workouts VALUES(7,4,'Deadlift','High',90);
INSERT INTO workouts VALUES(8,5,'Cycling','Medium',45);
INSERT INTO workouts VALUES(11,4,'Hammer Curl','High',20);
INSERT INTO workouts VALUES(12,4,'Bicep Curl','High',60);
INSERT INTO workouts VALUES(13,3,'Concentration Curl','Medium',60);
CREATE TABLE muscle(
    muscle_id           INT NOT NULL,
    muscle_name         VARCHAR(50)NOT NULL,
    muscle_position     TEXT CHECK(muscle_position IN ('left','right'))NOT NULL,
    --intensity can be given a number 15, 10, 5
    --super key
    UNIQUE(muscle_position,muscle_name)
    PRIMARY KEY(
        muscle_id
    )
);
INSERT INTO muscle VALUES(1,'biceps brachii','left');
INSERT INTO muscle VALUES(2,'biceps brachii','right');
INSERT INTO muscle VALUES(3,'rectus femorus','left');
INSERT INTO muscle VALUES(4,'rectus femorus','right');
CREATE TABLE muscle_workout(
    muscle_id INT NOT NULL,
    workout_id INT NOT NULL,
    FOREIGN KEY(
        muscle_id
    )REFERENCES muscle (muscle_id) ON DELETE CASCADE,
    FOREIGN KEY(
        workout_id
    )REFERENCES workout (workout_id) ON DELETE CASCADE
);
INSERT INTO muscle_workout VALUES(3,8);
INSERT INTO muscle_workout VALUES(4,8);
INSERT INTO muscle_workout VALUES(1,7);
INSERT INTO muscle_workout VALUES(2,7);
INSERT INTO muscle_workout VALUES(3,7);
INSERT INTO muscle_workout VALUES(4,7);
INSERT INTO muscle_workout VALUES(1,2);
INSERT INTO muscle_workout VALUES(2,2);
INSERT INTO muscle_workout VALUES(3,1);
INSERT INTO muscle_workout VALUES(4,1);
INSERT INTO muscle_workout VALUES(3,3);
INSERT INTO muscle_workout VALUES(4,3);
INSERT INTO muscle_workout VALUES(3,4);
INSERT INTO muscle_workout VALUES(4,4);
INSERT INTO muscle_workout VALUES(3,5);
INSERT INTO muscle_workout VALUES(4,5);
INSERT INTO muscle_workout VALUES(3,6);
INSERT INTO muscle_workout VALUES(4,6);
INSERT INTO muscle_workout VALUES(1,11);
INSERT INTO muscle_workout VALUES(2,11);
INSERT INTO muscle_workout VALUES(1,12);
INSERT INTO muscle_workout VALUES(2,12);
INSERT INTO muscle_workout VALUES(1,13);
INSERT INTO muscle_workout VALUES(2,13);
CREATE TABLE user_injury (
    muscle_id         INT NOT NULL,  
    user_id           INT NOT NULL,
    injury_intensity    TEXT CHECK (injury_intensity IN('severe','moderate','mild','none')) NOT NULL,
    --intensity can be given a number 15, 10, 5
    FOREIGN KEY(
        muscle_id
    )REFERENCES muscle (muscle_id) ON DELETE CASCADE,
    FOREIGN KEY(
        user_id
    )REFERENCES user(user_id) ON DELETE CASCADE
);
INSERT INTO user_injury VALUES(3,9014,'mild');
INSERT INTO user_injury VALUES(1,2710,'severe');
INSERT INTO user_injury VALUES(2,2710,'severe');
COMMIT;
exercises            user_feedback        users              
feedback             user_injury          workout_performance
muscle               user_plan_feedback   workout_plans      
muscle_workout       user_plan_history    workouts           
q_values             user_preferences   
exercises            user_feedback        users              
feedback             user_injury          workout_performance
muscle               user_plan_feedback   workout_plans      
muscle_workout       user_plan_history    workouts           
q_values             user_preferences   
exercises            user_feedback        users              
feedback             user_injury          workout_performance
muscle               user_plan_feedback   workout_plans      
muscle_workout       user_plan_history    workouts           
q_values             user_preferences   
exercises            user_feedback        users              
feedback             user_injury          workout_performance
muscle               user_plan_feedback   workout_plans      
muscle_workout       user_plan_history    workouts           
q_values             user_preferences   
7572|Ursa|Moses|Joseph F. Dudley|vulputate.dui.nec@icloud.ca|Strength|Beginner|2025-01-09 01:16:10
9014|Nora|Anthony|Nadine L. Harrison|nunc.sed@aol.com|Endurance|Advanced|2024-11-09 01:16:10
2710|Lucius|Puckett|Benedict Y. Meadows|cras.sed@yahoo.net|Hypertrophy|Beginner|2015-01-09 01:16:10
3601|Connor|Hurst|Chaim D. Guy|vel.arcu@aol.net|Strength|Advanced|2024-01-09 01:16:10
2624|Lila|Jacobson|Bryar Y. Richards|egestas.urna@icloud.net|Endurance|intermediate|2020-01-09 01:16:10
