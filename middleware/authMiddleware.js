// authMiddleware.js
const {jwtPassword} = require("../config");
const jwt = require('jsonwebtoken');
const jwtSecretKey = 'your_secret_key_here';

// Middleware for authentication
/*const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Bearer token not provided' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, jwtSecretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        req.user = decoded; // Set user data in request object for use in route handlers
        next(); // Call next middleware or route handler
    });
};

module.exports = authenticateUser;*/
function authenticateUser(req, res, next) {
    const token = req.headers.authorization; // bearer token
    const words = token.split(" "); // ["Bearer", "token"]
    const jwtToken = words[1]; // token
    try {
        const decodedValue = jwt.verify(jwtToken, jwtPassword);
        console.log(decodedValue); // Log decoded value to see its structure
        if (decodedValue.email) {
            console.log(decodedValue.email);
            req.user = decodedValue; 
            next();
        } else {
            res.status(403).json({
                "auth": "false",
                "message": "You are not authenticated"
            });
        }
    } catch(e) {
        res.status(403).json({
            "auth": "false",
            "message": "Invalid token"
        });
    }
}

module.exports = authenticateUser;
