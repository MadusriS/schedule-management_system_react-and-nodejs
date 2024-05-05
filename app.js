const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const authval=require('./middlewares/authval');
const jwtval= require('./middlewares/jwtval');
const app = express();
app.use(bodyParser.json());
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// API endpoints
// Assuming you have a user table in your database with columns: id, email, password, and name

app.post('/register', (req, res) => {
    const { email, password, name } = req.body;
    
    // Check if the email already exists in the database
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.log("im here1");
            return res.status(500).json({ error: err.message });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.log("im here2");
                return res.status(500).json({ error: err.message });
            }

            // Insert the user into the database
            db.query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hash, name], (err, result) => {
                if (err) {
                    console.log("im here3");
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: 'User registered successfully' });
            });
        });
    });
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if the email exists in the database
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Email or password incorrect' });
        }

        const user = results[0];

        // Compare the provided password with the hashed password from the database
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!result) {
                return res.status(401).json({ error: 'Email or password incorrect' });
            }

            // Generate a JWT token
            const token = jwt.sign({ email: user.email, userId: user.id }, jwtPassword, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token: token });
        });
    });
});


// API endpoints
app.post('/schedule', (req, res) => {
    const { name, days, start_time, end_time } = req.body;
    db.insertSchedule(name, days, start_time, end_time, (err, result) => {
        if (err) return res.status(500).send({ error: err.message });
        res.send({ message: 'Schedule created successfully' });
    });
});
const convertTo24HourFormat = (time) => {
    return new Date(`1970-01-01 ${time}`).toLocaleTimeString('en-US', { hour12: false });
};

app.delete('/schedule', (req, res) => {
    
    const { day, taskname, start_time } = req.body;
    let std_time = convertTo24HourFormat(start_time);
    db.deleteSchedule(day, taskname, std_time, (err, result) => {
        if (err) return res.status(500).send({ error: err.message });
        console.log('result in app.js:',result);
        if (result.changedRows > 0) {
            res.send({ message: 'Schedule successfully deleted(app.js)' });
        } else {
            res.status(404).send({ message: 'Schedule not found(app.js)' });
        }
    });
});

// API endpoint for GET /schedules
app.get('/schedules', (req, res) => {
    db.getAllSchedules((err, formattedSchedules) => {
        if (err) return res.status(500).send({ error: err.message });
        res.send(formattedSchedules);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
