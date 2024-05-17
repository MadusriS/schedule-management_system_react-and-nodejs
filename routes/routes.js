const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Schedule } = require('../models'); // Import your Sequelize models
const authenticateUser = require('../middleware/authMiddleware');
const cont = require('../controllers/schedule_controller');
const Sequelize = require('sequelize');
const router = express.Router();
const jwtSecretKey = 'your_secret_key_here';

// Register User
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashedPassword, name });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            // Error indicates that the email is already registered
            res.status(400).json({ error: 'User already registered' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});


// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Email or password is incorrect' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email or password are incorrect' });
        }
        const token = jwt.sign({ email: user.email, user_id: user.id }, jwtSecretKey, { expiresIn: '2h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Protected Route - Schedule



// Define the capitalize function
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

router.post('/schedule', authenticateUser, async (req, res) => {
    const user_id = req.user.user_id;
    console.log(req.user.user_id); // Get used from the decoded JWT payload
    const { name, days, start_time, end_time } = req.body;

    try {
        // Check if  is provided
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Capitalize the first letter of each day while keeping the rest lowercase
        const capitalizedDays = days.map(day => capitalize(day));

        // Define an array of weekdays
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday','Sunday'];

        // Check if all provided days are weekdays
        const areAllWeekdays = capitalizedDays.every(day => weekdays.includes(day));

        // If all days are weekdays, proceed with schedule insertion; otherwise, return an error message
        /*if (!areAllWeekdays) {
            return res.status(400).json({ error: 'Only weekdays (Monday to Friday) are allowed as input' });
        }*/

        // Call insertSchedule function from controller to insert the schedule
        cont.insertSchedule(user_id, name, capitalizedDays, start_time, end_time, (err, newSchedule) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Schedule created successfully', schedule: newSchedule });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



/*json insert schedule eg request:
{
  "name":"tea break",
  "days":["Wednesday","Thursday","Friday","Saturday","Sunday"],
  "start_time":"07:00 AM",
  "end_time":"08:00 AM"
}*/



router.delete('/schedule', authenticateUser, async (req, res) => {
    const user_id = req.user.user_id; 
    console.log(req.user.user_id);// Extract  from the decoded JWT payload
    const { day, taskname, start_time } = req.body;

    try {
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Call deleteSchedule function from controller to delete the schedule
        const result = await cont.deleteSchedule(user_id, day, taskname, start_time);

        res.json(result); // Send response with the result from deleteSchedule function
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*eg json request:
{
  
  "day":"Thursday",
  "taskname":"tea break",
  "start_time":"07:00 AM"
  
}*/


router.get('/schedules/:day', authenticateUser, async (req, res) => {
    const user_id = req.user.user_id; 
    const day=req.params.day;
    console.log(day);

    try {
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Call getAllSchedules function from controller to get schedules
        const formattedSchedules = await cont.getAllSchedules(user_id,day);
        //res.setHeader('Content-Type', 'application/json');
        res.json(formattedSchedules); // Send response with the formatted schedules
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Function to convert time to AM/PM format
const formatToAMPM = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};


module.exports = router;
