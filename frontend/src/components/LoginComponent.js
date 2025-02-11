import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginComponent.css'; // Ensure this path is correct

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(process.env.API_URL);

        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                localStorage.setItem('token', data.token);
                navigate('/dashboard');
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleregister = () => {
        navigate('/register');
    };

    return (
        <div className="login-container">
            <nav className="navbar">
                <img
                    src="https://i.pcmag.com/imagery/reviews/07MJqoGL3dKLVxhWIJqfhZm-28.fit_lim.size_1050x591.v1664811718.jpg"
                    alt="Mobicip Logo"
                    className="navbar-logo"
                />
            </nav>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
                <button type="button" onClick={handleregister}>New user?</button>
            </form>
            <img
                src="https://webs.prgr.in/packs/media/images/s_illus_location-13ad654ddd97d993bfa6b78f1dc70c7b.svg"
                alt="Location Illustration"
                className="location-img"
            />
        </div>
    );
};

export default Login;
