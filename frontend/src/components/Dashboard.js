import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [schedules, setSchedules] = useState([]);
    const [selectedDay, setSelectedDay] = useState('');
    const navigate = useNavigate();

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

            const responseData = await response.json();
            console.log('Parsed Schedules:', responseData);

            setSchedules(responseData);
        } catch (error) {
            console.error('Error:', error);
            setSchedules([]);
        }
    };

    const handleDayClick = (day) => {
        setSelectedDay(day);
        fetchSchedules(day);
    };

    const handleDeleteClick = async (schedule) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/schedule', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    day: selectedDay,
                    taskname: schedule.name,
                    start_time: schedule.start_time
                })
            });

            const responseData = await response.json();
            console.log('Delete Response:', responseData);

            if (response.ok) {
                fetchSchedules(selectedDay);
            } else {
                console.error('Failed to delete schedule:', responseData);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
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
            <h3>{selectedDay}</h3>
            <ul>
                {schedules.length > 0 ? schedules.map((schedule, index) => (
                    <li key={index}>
                        {schedule.name} ({schedule.start_time} - {schedule.end_time})   
                        <button onClick={() => handleDeleteClick(schedule)}>Delete</button>
                    </li>
                )) : (
                    <li></li>
                )}
            </ul>
            <Link to="./AddSchedule">
                <button>Add Schedule</button>
            </Link>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;


