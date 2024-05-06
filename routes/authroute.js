const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtPassword } = require("../config");
const pool = require("../db/db");
const { emailFormatChecker, passwordFormatChecker, nameNullChecker } = require("../middlewares/authval");

const authRouter = express.Router();

authRouter.get("/signup", (req, res) => {
    res.json({
        "message": "Render signup page"
    });
});

authRouter.post("/signup", emailFormatChecker, passwordFormatChecker, nameNullChecker, async (req, res) => {
    const email = req.headers['email'].trim().toLowerCase();
    let searchUserlQuery = "SELECT * FROM users WHERE Email = ?";
    const [result] = await pool.query(searchUserlQuery, [email]);
    if (result.length != 0) {
        res.json({
            "message": "User already exists"
        });
    } else {
        const username = req.headers['fullname'].trim();
        const password = req.headers['password'].trim();

        const bcryptPassword = await bcrypt.hash(password, 10);
        let insertUserQuery = "INSERT INTO users (Fullname, Email, password, created_at, updated_at) VALUES (?, ?, ?, now(), now())";
        await pool.query(insertUserQuery, [username, email, bcryptPassword]);
        const token = jwt.sign({ email }, jwtPassword, { "expiresIn": "5h" });
        res.status(202).json({
            "success": true,
            "message": "Signup successful",
            token
        });
    }
});

authRouter.get("/login", (req, res) => {
    res.json({
        "message": "Render login page"
    });
});

authRouter.post("/login", emailFormatChecker, async (req, res) => {
    const email = req.headers['email'].trim().toLowerCase();
    let searchUserQuery = "SELECT password FROM users WHERE Email = ?";
    const [result] = await pool.query(searchUserQuery, [email]);
    if (result.length != 0) {
        const password = req.headers['password'].trim();
        const isMatch = await bcrypt.compare(password, result[0].password);
        if (isMatch) {
            const token = jwt.sign({ email }, jwtPassword);
            res.status(202).json({
                "success": true,
                "message": "Login successful",
                token
            });
        } else {
            res.status(403).json({
                "success": false,
                "message": "Password is incorrect"
            });
        }
    } else {
        res.status(403).json({
            "success": false,
            "message": "User does not exist"
        });
    }
});

module.exports = authRouter;
