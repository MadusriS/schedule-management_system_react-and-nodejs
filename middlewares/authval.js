const zod = require("zod");
// Some other module

const db = require('../db');

// Example usage



function emailFormatChecker(req, res, next) {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) {
        return res.status(403).json({ "email": "Email not provided" });
    }
    const emailCheck = zod.string().email();
    let response = emailCheck.safeParse(email);
    if (response.success) {
        next();
    } else {
        res.status(403).json({ "email": "Wrong email format" });
    }
}

function passwordFormatChecker(req, res, next) {
    const password = req.body.password?.trim();
    if (!password) {
        return res.status(403).json({ "password": "Password not provided" });
    }
    const passwordCheck = zod.string().min(7);
    let response = passwordCheck.safeParse(password);
    if (response.success) {
        next();
    } else {
        res.status(403).json({ "password": "The password should be at least 7 characters long" });
    }
}

function nameNullChecker(req, res, next) {
    const name = req.body.name?.trim();
    if (!name) {
        return res.status(403).json({ "name": "Name not provided" });
    }
    const nameCheck = zod.string().min(1);
    let response = nameCheck.safeParse(name);
    if (response.success) {
        next();
    } else {
        res.status(403).json({ "name": "The name should be at least 1 character long" });
    }
}

module.exports = { emailFormatChecker, passwordFormatChecker, nameNullChecker };
