import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [schedules, setSchedules] = useState([]); // Initialize as an empty array
    const [selectedDay, setSelectedDay] = useState('');

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const fetchSchedules = async (day) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/schedules/${day}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const responseData = await response.text();
            console.log('Raw Response:', responseData);
            //const cleanedResponse = responseData.replace(/^"|"$/g, '');

            // Split the response string into an array of strings by line breaks
            const schedulesArray = responseData.replace(/^"|"$/g, '').split(',').map(schedule => schedule.trim()).filter(schedule => schedule.length > 0);
            console.log('Parsed Schedules:', schedulesArray);

            setSchedules(schedulesArray);
        } catch (error) {
            console.error('Error:', error);
            setSchedules([]); // Set to empty array on error
        }
    };

    const handleDayClick = (day) => {
        setSelectedDay(day);
        fetchSchedules(day);
    };

    return (
        <div>
            <h2>Schedules</h2>
            <div>
                {daysOfWeek.map(day => (
                    <button key={day} onClick={() => handleDayClick(day)}>
                        {day}
                    </button>
                ))}
            </div>
            <h3>{selectedDay} Schedules</h3>
            <ul>
                {schedules.length > 0 ? schedules.map((schedule, index) => (
                    <li key={index}>{schedule}</li>
                )) : (
                    <li>No schedules available</li>
                )}
            </ul>
            {/* Add Schedule button linked to AddSchedule component */}
            <Link to="./AddSchedule">
                <button>Add Schedule</button>
            </Link>
        </div>
    );
};

export default Dashboard;
