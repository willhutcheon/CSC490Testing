"use strict";

const express = require("express");
const app = express();
const multer = require("multer");
app.use(multer().none());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const model = require("../models/crudmodel");

async function createUser(req, res, next) {
    let { user_id, fname, lname, username, email, fit_goal, exp_level } = req.body;
    user_id = parseInt(user_id, 10);
    console.log("Received parameters:", { user_id, fname, lname, username, email, fit_goal, exp_level });
    if (isNaN(user_id)) {
        console.error("user_id is not a number:", req.body.user_id);
        return res.status(400).send({ error: "User ID must be a number" });
    }
    if (user_id && fname && lname && username && email && fit_goal && exp_level) {
        let params = [user_id, fname, lname, username, email, fit_goal, exp_level, new Date().toISOString()];
        console.log("Params for DB:", params);
        try {
            await model.createUser(params);
            res.status(201).send({ message: "User created successfully" });
        } catch (err) {
            console.error("Error while creating a new user, talk to Will", err.message);
            res.status(500).send({ error: "Failed to create user" });
            next(err);
        }
    } else {
        res.status(400).send({ error: "Missing required fields" });
    }
}
async function createPreferences(req, res, next) {
    let { preference_id, user_id, preferred_types, preferred_intensity, preferred_duration, preferred_exercise } = req.body;
    user_id = parseInt(user_id, 10);
    if (isNaN(user_id)) {
        console.error("user_id is not a number:", req.body.user_id);
        return res.status(400).send({ error: "User ID must be a number" });
    }
    if (preference_id && user_id && preferred_types && preferred_intensity && preferred_duration && preferred_exercise) {
        let params = [preference_id, user_id, preferred_types, preferred_intensity, preferred_duration, preferred_exercise];
        try {
            await model.createPreferences(params);
            res.status(201).send({ message: "User preferences created successfully" });
        } catch (err) {
            console.error("Error while creating a new user preferences, talk to Will", err.message);
            res.status(500).send({ error: "Failed to create user preferences" });
            next(err);
        }
    } else {
        res.status(400).send({ error: "Missing required fields" });
    }
}
async function updateUser(req, res, next) {
    let { user_id, fname, lname, username, email, fit_goal, exp_level } = req.body;
    user_id = parseInt(user_id, 10);
    if (isNaN(user_id)) {
        console.error("user_id is not a number:", req.body.user_id);
        return res.status(400).send({ error: "User ID must be a number" });
    }
    if (fname && lname && username && email && fit_goal && exp_level) {
        let params = [fname, lname, username, email, fit_goal, exp_level, user_id];
        try {
            await model.updateUser(params);
            res.status(200).send({ message: "User updated successfully" });
        } catch (err) {
            console.error("Error while updating user account, talk to Will", err.message);
            res.status(500).send({ error: "Failed to update user" });
            next(err);
        }
    } else {
        res.status(400).send({ error: "Missing required fields" });
    }
}
async function updatePreferences(req, res, next) {
    let { user_id, preferred_types, preferred_intensity, preferred_duration, preferred_exercise } = req.body;
    user_id = parseInt(user_id, 10);
    if (isNaN(user_id)) {
        console.error("user_id is not a number:", req.body.user_id);
        return res.status(400).send({ error: "User ID must be a number" });
    }
    if (preferred_types && preferred_intensity && preferred_duration && preferred_exercise) {
        let params = [preferred_types, preferred_intensity, preferred_duration, preferred_exercise, user_id];
        try {
            await model.updatePreferences(params);
            res.status(200).send({ message: "User preferences updated successfully" });
        } catch (err) {
            console.error("Error while updating user preferences:", err.message);
            res.status(500).send({ error: "Failed to update user preferences" });
            next(err);
        }
    } else {
        res.status(400).send({ error: "Missing required fields" });
    }
}
async function getUser(req, res, next) {
    const user_id = req.params.user_id;
    try {
        const user = await model.getUser(user_id);
        if (user) {
            // res.render('update-user', { user, user_id: user.user_id, error: null, message: null });
            res.status(200).json({ user });
        } else {
            res.status(404).send({ error: "User not found"});
        } 
    } catch (err) {
        console.error("Error fetching user:", err.message);
        res.status(500).send({ error: "Failed to fetch user data" });
        next(err);
    }
}
async function getPreferences(req, res, next) {
    const user_id = req.params.user_id;
    try {
        const user = await model.getUser(user_id);
        const preferences = await model.getPreferences(user_id);
        if (user && preferences) {
            // res.render('update-preferences', {user, preferences, error: null, message: null });
            res.status(200).json({ user, preferences });
        } else {
            res.status(404).send({ error: "User or preferences not found" });
        }
    } catch (err) {
        console.error("Error fetching user or preferences:", err.message);
        res.status(500).send({ error: "Failed to fetch user or preferences data" });
        next(err);
    }
}
module.exports = {
    createUser,
    updateUser,
    getUser,
    updatePreferences,
    getPreferences,
    createPreferences
}