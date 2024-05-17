import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddSchedule = () => {
  const [name, setName] = useState('');
  const [days, setDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [startAmPm, setStartAmPm] = useState('AM');
  const [endTime, setEndTime] = useState('');
  const [endAmPm, setEndAmPm] = useState('AM');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


  useEffect(() => {
    // Add a request interceptor
    const interceptor = axios.interceptors.request.use(
      (config) => {
        // Get token from local storage
        const token = localStorage.getItem('token');
        // Attach token to the request headers
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on component unmount
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  const handleDayClick = (day) => {
    setDays(prevDays => 
      prevDays.includes(day) 
        ? prevDays.filter(d => d !== day) 
        : [...prevDays, day]
    );
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    const formattedStartTime = `${startTime} ${startAmPm}`;
    const formattedEndTime = `${endTime} ${endAmPm}`;
    const newSchedule = { name, days, start_time: formattedStartTime, end_time: formattedEndTime };

    axios.post('http://localhost:3001/schedule', newSchedule)
      .then(response => {
        console.log('Response:', response);
        setError('');
        alert('Schedule added successfully');
        navigate('/dashboard'); // Redirect to the dashboard
      })
      .catch(error => {
        console.error('Error response:', error.response);
        setError(error.response?.data?.error || 'An error occurred');
      });
  };

  const handleCancel = () => {
    navigate('/dashboard'); // Redirect to the dashboard
  };

  return (
    <div>
      <h2>Add Schedule</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Days: </label>
          <div>
            {daysOfWeek.map(day => (
              <button
                type="button"
                key={day}
                onClick={() => handleDayClick(day)}
                style={{ backgroundColor: days.includes(day) ? 'lightblue' : 'white' }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label>Start Time: </label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          <select value={startAmPm} onChange={(e) => setStartAmPm(e.target.value)}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
        <div>
          <label>End Time: </label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          <select value={endAmPm} onChange={(e) => setEndAmPm(e.target.value)}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
        <button type="submit">Save</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AddSchedule;

