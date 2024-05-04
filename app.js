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

app.delete('/schedule', (req, res) => {
    const { day, taskname, start_time } = req.body;
    db.deleteSchedule(day, taskname, start_time, (err, result) => {
        if (err) return res.status(500).send({ error: err.message });
        if (result.affectedRows > 0) {
            res.send({ message: 'Schedule successfully deleted' });
        } else {
            res.status(404).send({ message: 'Schedule not found' });
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
