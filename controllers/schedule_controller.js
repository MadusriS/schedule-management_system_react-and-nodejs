const { Schedule } = require('../models'); // Import your Schedule Sequelize model
const Sequelize = require('sequelize');
// Function to create table if it does not exist
const createTable = async () => {
    try {
        await Schedule.sync(); // This will create the table if it doesn't exist
        console.log('Table created or already exists');
    } catch (error) {
        console.error('Error creating table:', error.message);
        throw error;
    }
};


const insertSchedule = async (userId, name, days, start_time, end_time, callback) => {
    try {
        const daysBinary = convertDaysToBinary(days);
        const startTime24 = convertTo24HourFormat(start_time);
        const endTime24 = convertTo24HourFormat(end_time);

        // Check for overlapping schedules in the database for the specific user
        const overlappingSchedules = await Schedule.findAll({
            where: {
                user_id: userId,
                [Sequelize.Op.and]: [
                    Sequelize.literal(`(days & ${daysBinary}) != 0`),
                    {
                        [Sequelize.Op.or]: [
                            {
                                // Existing schedule starts during the new schedule
                                start_time: { [Sequelize.Op.between]: [startTime24, endTime24] }
                            },
                            {
                                // Existing schedule ends during the new schedule
                                end_time: { [Sequelize.Op.between]: [startTime24, endTime24] }
                            },
                            {
                                // New schedule completely overlaps the existing schedule
                                start_time: { [Sequelize.Op.lte]: startTime24 },
                                end_time: { [Sequelize.Op.gte]: endTime24 }
                            }
                        ]
                    }
                ]
            }
        });

        if (overlappingSchedules.length > 0) {
            return callback(new Error('Overlap detected. Please choose a different time slot.'));
        }

        // No overlapping schedules found, insert the new schedule
        const newSchedule = await Schedule.create({
            user_id: userId,
            name: name,
            days: daysBinary,
            start_time: startTime24,
            end_time: endTime24
        });

        callback(null, newSchedule);
    } catch (error) {
        callback(error);
    }
};



const deleteSchedule = async (user_id, day, taskname, start_time) => {
    try {
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

        // Find the schedule to update
        const schedule = await Schedule.findOne({
            where: {
                user_id: user_id,
                name: taskname,
                start_time: std_time
            }
        });

        if (!schedule) {
            return { message: 'No schedule found for deletion' };
        }

        // Update the schedules where days match and set days to the bitwise AND result
        await Schedule.update(
            { days: Sequelize.literal(`days & ~${binaryDay}`) },
            {
                where: {
                    user_id: user_id,
                    name: taskname,
                    start_time: std_time
                }
            }
        );

        // Delete rows where 'days' column becomes zero
        await Schedule.destroy({
            where: {
                user_id: user_id,
                days: 0
            }
        });

        return { message: 'Schedule successfully deleted' };
    } catch (error) {
        throw error;
    }
};





const getAllSchedules = async (user_id, day) => {
    try {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const index = daysOfWeek.indexOf(day);

        // Find all schedules for the user
        const schedules = await Schedule.findAll({
            where: { user_id: user_id },
            attributes: ['name', 'start_time', 'end_time', 'days']
        });

        console.log('All Schedules:', schedules); // Log all schedules retrieved from the database

        // Filter schedules for the specified day
        const filteredSchedules = schedules.filter(schedule => {
            if (index !== -1) {
                const mask = 1 << index;
                return (schedule.days & mask) !== 0;
            } else {
                return false; // If day is not found in daysOfWeek, return false
            }
        });

        // Sort schedules by start time before formatting
        filteredSchedules.sort((a, b) => a.start_time.localeCompare(b.start_time));

        // Format the filtered schedules
        const formattedSchedules = filteredSchedules.map(schedule => ({
            name: schedule.name,
            start_time: formatToAMPM(schedule.start_time),
            end_time: formatToAMPM(schedule.end_time)
        }));

        return formattedSchedules;
    } catch (error) {
        throw error;
    }
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

const convertTo24HourFormat = (time) => {
    return new Date(`1970-01-01 ${time}`).toLocaleTimeString('en-US', { hour12: false });
};



module.exports = {
    createTable,
    insertSchedule,
    deleteSchedule,
    getAllSchedules,
    convertTo24HourFormat// Export the function
};
