import React, { useState } from 'react';
import axios from 'axios';

const AddSchedule = () => {
  const [name, setName] = useState('');
  const [days, setDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const newSchedule = { name, days, start_time: startTime, end_time: endTime };
    axios.post('http://localhost:3001/schedules', newSchedule)
      .then(response => {
        setError('');
        alert('Schedule added successfully');
      })
      .catch(error => setError(error.response.data.error));
  };

  const handleDaysChange = (event) => {
    const value = event.target.value;
    setDays(value.split(',').map(day => day.trim()));
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
          <label>Days (comma separated): </label>
          <input type="text" value={days} onChange={handleDaysChange} required />
        </div>
        <div>
          <label>Start Time: </label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div>
          <label>End Time: </label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
        <button type="submit">Add Schedule</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AddSchedule;
