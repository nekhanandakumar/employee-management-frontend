import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
           const response = await login(username, password);

// Save token
localStorage.setItem("token", response.token);

// Save user info
localStorage.setItem("user", JSON.stringify(response.user));

if (response.user.role === "Admin") {
    navigate("/admin-dashboard");
} else {
    navigate("/employee-dashboard");
}

        } catch (err) {
    console.log(err.response); // optional debug

    const msg =
        err.response?.data?.message ||
        'Invalid username or password';

    setError(msg);
}

    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Employee Management System</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error">{error}</div>}
                    <button type="submit" className="btn-login">Login</button>
                </form>
                <p className="register-link">
                    Don't have an account? <span onClick={() => navigate('/register')}>Register</span>
                </p>
            </div>
        </div>
    );
}

export default Login;