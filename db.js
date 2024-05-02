const mysql = require('mysql');

// Configure MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Madusri@2002',
    database: 'scheduler'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

// Function to create table if it does not exist
const createTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        days INT,
        start_time TIME,
        end_time TIME
    )`;
    db.query(sql, (err) => {
        if (err) throw err;
        console.log('Table created or already exists');
    });
};
createTable();

// Function to convert days to binary
const convertDaysToBinary = (days) => {
    const DAYS_MAPPING = {
        'Monday': 0b0000001,
        'Tuesday': 0b0000010,
        'Wednesday': 0b0000100,
        'Thursday': 0b0001000,
        'Friday': 0b0010000,
        'Saturday': 0b0100000,
        'Sunday': 0b1000000
    };

    let binary = 0;
    days.forEach(day => {
        binary |= DAYS_MAPPING[day];
    });
    return binary;
};

// Function to insert a new schedule
const insertSchedule = (name, days, start_time, end_time, callback) => {
    const daysBinary = convertDaysToBinary(days);
    const insertQuery = `INSERT INTO schedules (name, days, start_time, end_time)
                         VALUES (?, ?, ?, ?)`;
    db.query(insertQuery, [name, daysBinary, start_time, end_time], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
};

// Function to delete a schedule
const deleteSchedule = (day, taskname, start_time, callback) => {
    const DAYS_MAPPING = {
        'Monday': 0b0000001,
        'Tuesday': 0b0000010,
        'Wednesday': 0b0000100,
        'Thursday': 0b0001000,
        'Friday': 0b0010000,
        'Saturday': 0b0100000,
        'Sunday': 0b1000000
    };
    const binaryDay = DAYS_MAPPING[day];
    const deleteQuery = `DELETE FROM schedules WHERE name = ? AND start_time = ? AND days & ? != 0`;
    db.query(deleteQuery, [taskname, start_time, binaryDay], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
};

// Function to retrieve all schedules
const getAllSchedules = (callback) => {
    const getQuery = `SELECT * FROM schedules`;
    db.query(getQuery, (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
};

module.exports = {
    insertSchedule,
    deleteSchedule,
    getAllSchedules
};
