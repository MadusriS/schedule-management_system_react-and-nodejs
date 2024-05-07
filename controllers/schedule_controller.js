const db = require('../db'); // Update the path accordingly

// Function to create table if it does not exist
const createTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(255),
        days INT,
        start_time TIME,
        end_time TIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;
    db.query(sql, (err) => {
        if (err) throw err;
        console.log('Table created or already exists');
    });
};
createTable();

const insertSchedule = (userId, name, days, start_time, end_time, callback) => {
    const daysBinary = convertDaysToBinary(days);
    const startTime24 = convertTo24HourFormat(start_time);
    const endTime24 = convertTo24HourFormat(end_time);

    // Check for overlapping schedules in the database for the specific user
    const checkOverlapQuery = `SELECT * FROM schedules WHERE 
                                user_id = ? AND
                                days & ? > 0 AND
                                ((start_time < ? AND end_time > ?) OR
                                (start_time < ? AND end_time > ?) OR
                                (start_time >= ? AND end_time <= ?))`;
    db.query(checkOverlapQuery, [userId, daysBinary, startTime24, startTime24, endTime24, endTime24, startTime24, endTime24], (err, overlappingSchedules) => {
        if (err) return callback(err);

        if (overlappingSchedules.length > 0) {
            return callback(new Error('Overlap detected. Please choose a different time slot.'));
        }

        const insertQuery = `INSERT INTO schedules (user_id, name, days, start_time, end_time)
                             VALUES (?, ?, ?, ?, ?)`;
        db.query(insertQuery, [userId, name, daysBinary, startTime24, endTime24], (err, result) => {
            if (err) return callback(err);
            callback(null, result);
        });
    });
};


const deleteSchedule = (userId, day, taskname, start_time, callback) => {
    const std_time = convertTo24HourFormat(start_time);

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

    const deleteQuery = `UPDATE schedules 
                         SET days = days & ~${binaryDay}
                         WHERE user_id = ? AND name = ? AND start_time = ?`;

    db.query(deleteQuery, [userId, taskname, std_time], (err, result) => {
        if (err) {
            console.error('SQL Error:', err);
            return callback(err);
        }
        callback(null, result);
    });
};


const convertTo24HourFormat = (time) => {
    return new Date(`1970-01-01 ${time}`).toLocaleTimeString('en-US', { hour12: false });
};

// Function to get all schedules
const getAllSchedules = (userId, callback) => {
    const getQuery = `SELECT name, days,  start_time, end_time FROM schedules WHERE user_id = ?`;
    db.query(getQuery, [userId], (err, results) => {
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
                        rawStartTime: schedule.start_time, // Keep the original start time for sorting purposes
                        rawEndTime: schedule.end_time // Keep the original end time for converting to AM/PM format
                    });
                }
            });
        });

        // Sort schedules for each day based on start time
        formattedSchedules.forEach(daySchedule => {
            daySchedule.schedules.sort((a, b) => {
                return a.rawStartTime.localeCompare(b.rawStartTime);
            });
            // Convert time to AM/PM format after sorting
            daySchedule.schedules.forEach(schedule => {
                schedule.timeRange = `${formatToAMPM(schedule.rawStartTime)} - ${formatToAMPM(schedule.rawEndTime)}`;
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


module.exports = {
    createTable,
    insertSchedule,
    deleteSchedule,
    getAllSchedules,
    convertTo24HourFormat// Export the function
};
