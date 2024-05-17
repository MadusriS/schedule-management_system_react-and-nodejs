// authMiddleware.js
const { jwtPassword } = require("../config");
const jwt = require('jsonwebtoken');

// Middleware for authentication
function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        // Check if the authorization header is present
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Bearer token not provided' });
        }

        // Split the header to get the token
        const token = authHeader.split(' ')[1];
        
        // Verify the token
        jwt.verify(token, jwtPassword, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }
            req.user = decoded; // Set user data in request object for use in route handlers
            next(); // Call next middleware or route handler
        });
    } catch (e) {
        // Catch any unexpected errors
        console.error('Error in authenticateUser:', e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = authenticateUser;


