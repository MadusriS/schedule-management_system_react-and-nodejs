import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/LoginComponent';
import Registration from './components/RegistrationForm';
import Addschedule from './components/AddSchedule';
//import Dashboard from './Dashboard';
//import PrivateRoute from './PrivateRoute';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/addschedule" element={<Addschedule />} />

                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Registration} />
       
            </Routes>
        </Router>
    );
};

export default App;


