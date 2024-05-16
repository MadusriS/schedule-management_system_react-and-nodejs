import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/schedules')
      .then(response => setSchedules(response.data))
      .catch(error => console.error('Error fetching schedules:', error));
  }, []);

  const deleteSchedule = (id) => {
    axios.delete(`http://localhost:3001/schedules/${id}`)
      .then(() => setSchedules(schedules.filter(schedule => schedule.id !== id)))
      .catch(error => console.error('Error deleting schedule:', error));
  };

  return (
    <div>
      <h2>Schedules</h2>
      <ul>
        {schedules.map(schedule => (
          <li key={schedule.id}>
            {schedule.day} - {schedule.name} ({schedule.start_time} - {schedule.end_time})
            <button onClick={() => deleteSchedule(schedule.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScheduleList;
