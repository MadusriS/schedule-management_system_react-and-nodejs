const { jwtSecretKey } = require("../config");
const jwt = require("jsonwebtoken");

const db = require('../db');

// Example usage


function loginCheckMiddleware(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(403).json({ "auth": false, "message": "Token not provided" });
    }
    const words = token.split(" ");
    const jwtToken = words[1];
    try {
        const decodedValue = jwt.verify(jwtToken, jwtPassword);
        console.log(decodedValue);
        if (decodedValue.email) {
            console.log(decodedValue.email);
            next();
        } else {
            res.status(403).json({ "auth": false, "message": "You are not authenticated" });
        }
    } catch (e) {
        res.status(403).json({ "auth": false, "message": "Incorrect token" });
    }
}

module.exports = { loginCheckMiddleware };
