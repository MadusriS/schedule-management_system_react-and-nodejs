import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/LoginComponent';
import Registration from './components/RegistrationForm';
//import Dashboard from './Dashboard';
//import PrivateRoute from './PrivateRoute';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Registration} />
       
            </Routes>
        </Router>
    );
};

export default App;


