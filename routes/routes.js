// routes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticateUser = require('../middleware/authMiddleware');
const cont= require('../controllers/schedule_controller')

const router = express.Router();
const jwtSecretKey = 'your_secret_key_here';

// Register User
router.post('/register', (req, res) => {
    const { email, password, name } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        db.query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hash, name], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
});

// Login User
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Email or password is incorrect' });
        }
        const user = results[0];
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!result) {
                return res.status(401).json({ error: 'Email or password are incorrect' });
            }
            const token = jwt.sign({ email: user.email, userId: user.id }, jwtSecretKey, { expiresIn: '2h' });
            res.status(200).json({ message: 'Login successful', token: token });
        });
    });
});

// Protected Route - Schedule



// Function to capitalize the first letter of a string
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

router.post('/schedule', authenticateUser, (req, res) => {
    const userId = req.user.userId; // Get userId from the decoded JWT payload
    const { name, days, start_time, end_time } = req.body;

    // Check if userId is provided
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // Capitalize the first letter of each day while keeping the rest lowercase
    const capitalizedDays = days.map(day => capitalize(day));

    // Define an array of weekdays
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // Check if all provided days are weekdays
    const areAllWeekdays = capitalizedDays.every(day => weekdays.includes(day));

    // If all days are weekdays, proceed with schedule insertion; otherwise, return an error message
    if (areAllWeekdays) {
        cont.insertSchedule(userId, name, capitalizedDays, start_time, end_time, (err, result) => {
            if (err) return res.status(500).send({ error: err.message });
            res.send({ message: 'Schedule created successfully' });
        });
    } else {
        res.status(400).json({ error: 'Only weekdays (Monday to Friday) are allowed as input' });
    }
});

/*json insert schedule eg request:
{
  "name":"tea break",
  "days":["Wednesday","Thursday","Friday","Saturday","Sunday"],
  "start_time":"07:00 AM",
  "end_time":"08:00 AM"
}*/

router.delete('/schedule', authenticateUser, (req, res) => {
    const userId = req.user.userId; // Extract userId from the decoded JWT payload
    const { day, taskname, start_time } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    let std_time = cont.convertTo24HourFormat(start_time);
    cont.deleteSchedule(userId, day, taskname, std_time, (err, result) => {
        if (err) return res.status(500).send({ error: err.message });
        if (result.changedRows > 0) {
            res.send({ message: 'Schedule successfully deleted' });
        } else {
            res.status(404).send({ message: 'Schedule not found' });
        }
    });
});


/*eg json request:
{
  
  "day":"Thursday",
  "taskname":"tea break",
  "start_time":"07:00 AM"
  
}*/

router.get('/schedules', authenticateUser, (req, res) => {
    const userId = req.user.userId; 
    cont.getAllSchedules(userId,(err, formattedSchedules) => {
        if (err) return res.status(500).send({ error: err.message });
        res.send(formattedSchedules);
    });
});

module.exports = router;
