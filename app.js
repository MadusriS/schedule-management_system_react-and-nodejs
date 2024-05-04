const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(bodyParser.json());

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
