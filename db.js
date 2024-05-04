// db.js

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

// Function to convert binary representation of days to an array of days
const convertBinaryToDays = (binary) => {
    const DAYS_MAPPING = {
        0b0000001: 'Monday',
        0b0000010: 'Tuesday',
        0b0000100: 'Wednesday',
        0b0001000: 'Thursday',
        0b0010000: 'Friday',
        0b0100000: 'Saturday',
        0b1000000: 'Sunday'
    };
    const days = [];
    Object.keys(DAYS_MAPPING).forEach(key => {
        if (binary & parseInt(key, 2)) {
            days.push(DAYS_MAPPING[key]);
        }
    });
    return days;
};

// Function to check for overlapping schedules
const checkForOverlap = (newStartTime, newEndTime, existingSchedules) => {
    for (const schedule of existingSchedules) {
        const startTime = new Date(`1970-01-01 ${schedule.start_time}`);
        const endTime = new Date(`1970-01-01 ${schedule.end_time}`);

        // Case 1: New schedule starts during an existing schedule
        if (newStartTime >= startTime && newStartTime < endTime) {
            return true; // Overlap found
        }

        // Case 2: New schedule ends during an existing schedule
        if (newEndTime > startTime && newEndTime <= endTime) {
            return true; // Overlap found
        }

        // Case 3: New schedule completely overlaps an existing schedule
        if (newStartTime <= startTime && newEndTime >= endTime) {
            return true; // Overlap found
        }
    }
    return false; // No overlap
};


// Function to insert a new schedule
// Function to insert a new schedule
const insertSchedule = (name, days, start_time, end_time, callback) => {
    const daysBinary = convertDaysToBinary(days);
    const startTime24 = convertTo24HourFormat(start_time);
    const endTime24 = convertTo24HourFormat(end_time);

    // Check for overlapping schedules in the database
    const checkOverlapQuery = `SELECT * FROM schedules WHERE 
                                days & ? > 0 AND
                                ((start_time < ? AND end_time > ?) OR
                                (start_time < ? AND end_time > ?) OR
                                (start_time >= ? AND end_time <= ?))`;
    db.query(checkOverlapQuery, [daysBinary, startTime24, startTime24, endTime24, endTime24, startTime24, endTime24], (err, overlappingSchedules) => {
        if (err) return callback(err);

        if (overlappingSchedules.length > 0) {
            return callback(new Error('Overlap detected. Please choose a different time slot.'));
        }

        const insertQuery = `INSERT INTO schedules (name, days, start_time, end_time)
                             VALUES (?, ?, ?, ?)`;
        db.query(insertQuery, [name, daysBinary, startTime24, endTime24], (err, result) => {
            if (err) return callback(err);
            callback(null, result);
        });
    });
};


// Function to convert days to binary
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



const getAllSchedules = (callback) => {
    const getQuery = `SELECT name, days, TIME_FORMAT(start_time, '%h:%i %p') AS start_time, TIME_FORMAT(end_time, '%h:%i %p') AS end_time FROM schedules`;
    db.query(getQuery, (err, results) => {
        if (err) return callback(err);

        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let formattedSchedules = daysOfWeek.map(day => ({ day, schedules: [] }));

        results.forEach(schedule => {
            daysOfWeek.forEach((day, index) => {
                if (schedule.days & (1 << index)) { // Bitwise AND to check if the schedule applies to this day
                    const timeRange = `${schedule.start_time} - ${schedule.end_time}`;
                    formattedSchedules[index].schedules.push({
                        name: schedule.name,
                        timeRange: timeRange,
                        rawStartTime: schedule.start_time // Keep the original start time for sorting purposes
                    });
                }
            });
        });

        // Sort schedules for each day based on start time
        formattedSchedules.forEach(daySchedule => {
            daySchedule.schedules.sort((a, b) => {
                return a.rawStartTime.localeCompare(b.rawStartTime);
            });
        });

        const formattedOutput = formattedSchedules
            .filter(day => day.schedules.length > 0)
            .map(day => `${day.day} - ${day.schedules.map(sch => `${sch.name} (${sch.timeRange})`).join(', ')}`)
            .join('\n');

        callback(null, formattedOutput);
    });
};










// Function to convert time to AM/PM format
const formatToAMPM = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// Function to convert time to 24-hour format
const convertTo24HourFormat = (time) => {
    return new Date(`1970-01-01 ${time}`).toLocaleTimeString('en-US', { hour12: false });
};
const deleteSchedule = (day, taskname, start_time, callback) => {
    console.log(`Original start_time input: ${start_time}`);
    let std_time = convertTo24HourFormat(start_time);
    console.log(`Converted start_time: ${std_time}`);

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
    console.log(`Day binary for ${day}: ${binaryDay}`);

    const deleteQuery = `UPDATE schedules 
                         SET days = days & ~${binaryDay}
                         WHERE name = '${taskname}'
                        
                         AND start_time = '${std_time}'`;

    console.log(`Executing query: ${deleteQuery} with taskname=${taskname}, binaryDay=${binaryDay}, std_time=${std_time}`);

    db.query(deleteQuery, (err, result) => {
        if (err) {
            console.error('SQL Error:', err);
            return callback(err);
        }
        console.log('Query Result:', result); // Add this line to log the result object
        console.log('Affected rows:', result.affectedRows);
        console.log('Changed rows:', result.changedRows); // Add this line to log the number of changed rows
        if (result.changedRows > 0 || result.affectedRows > 0) { // Modify condition if necessary
            callback(null,result);
        } else {
            callback(null, result);
        }
    });
    
};


module.exports = {
    insertSchedule,
    getAllSchedules,
    deleteSchedule
};




