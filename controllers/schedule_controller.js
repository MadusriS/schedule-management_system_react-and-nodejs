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
        console.log(userId);

        // Check for overlapping schedules in the database for the specific user
        const overlappingSchedules = await Schedule.findAll({
           
            where: {
                user_id: userId,
                days: daysBinary,
                [Sequelize.Op.or]: [
                    {
                        start_time: { [Sequelize.Op.lt]: endTime24 },
                        end_time: { [Sequelize.Op.gt]: startTime24 }
                    },
                    {
                        start_time: { [Sequelize.Op.lte]: endTime24 },
                        end_time: { [Sequelize.Op.gte]: startTime24 }
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





const getAllSchedules = async (user_id) => {
    try {
        // Find all schedules for the user
        const schedules = await Schedule.findAll({
            where: { user_id: user_id },
            attributes: ['name', 'days', 'start_time', 'end_time']
        });

        // Format the schedules as needed
        const formattedSchedules = formatSchedules(schedules);

        return formattedSchedules;
    } catch (error) {
        throw error;
    }
};

// Function to format schedules
const formatSchedules = (schedules) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let formattedSchedules = daysOfWeek.map(day => ({ day, schedules: [] }));

    schedules.forEach(schedule => {
        daysOfWeek.forEach((day, index) => {
            if (schedule.days & (1 << index)) { // Bitwise AND to check if the schedule applies to this day
                const timeRange = `${schedule.start_time} - ${schedule.end_time}`;
                formattedSchedules[index].schedules.push({
                    name: schedule.name,
                    timeRange: timeRange,
                    rawStartTime: schedule.start_time,
                    rawEndTime: schedule.end_time
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

return formattedOutput;
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
