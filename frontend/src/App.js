import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/LoginComponent';
import Registration from './components/RegistrationForm';
import Dashboard from './components/Dashboard';
import Addschedule from './components/AddSchedule';

// import PrivateRoute from './components/ProtectedRouteComponent'; // Assuming you have implemented PrivateRoute

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/AddSchedule" element={<Addschedule />} />
            </Routes>
        </Router>
    );
};

export default App;



