import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegistrationComponent.css';

const Registration = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, name }),
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                navigate('/login');
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="registration-wrapper">
            <nav className="navbar">
                <img
                    src="https://i.pcmag.com/imagery/reviews/07MJqoGL3dKLVxhWIJqfhZm-28.fit_lim.size_1050x591.v1664811718.jpg"
                    alt="Mobicip Logo"
                    className="navbar-logo"
                />
            </nav>
            <div className="content-container">
                <img
                    src="https://webs.prgr.in/packs/media/images/illustartion-manage-ea4b1ed9aefe734e2ff5b0cc2c94e436.svg"
                    alt="Illustration"
                    className="left-image"
                />
                <div className="registration-container">
                    <h2>Sign Up</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit" className="register-button">Register</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Registration;

