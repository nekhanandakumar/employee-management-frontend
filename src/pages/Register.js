import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import './Register.css';
import axios from 'axios';


function Register() {
    const [formData, setFormData] = useState({
        name: '',
        designation: '',
        address: '',
        department: '',
        joiningDate: '',
        skillset: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
    }

    try {
        const employeeData = {
            name: formData.name,
            designation: formData.designation,
            address: formData.address,
            department: formData.department,
            joiningDate: formData.joiningDate || null,
            skillset: formData.skillset,
            username: formData.username,
            password: formData.password,
            role: 'Employee',
            status: 'Active',
            createdBy: 'Self'
        };

        // ✅ 1️⃣ Register employee first
        const response = await register(employeeData);
const employeeId = response.employeeId;
if (!employeeId) {
    setError("Registration failed: No employee ID returned");
    return;
}



        // ✅ 2️⃣ Upload image if selected
        if (selectedFile) {
    const formDataImage = new FormData();
    formDataImage.append("file", selectedFile);

    await axios.post(
        `https://localhost:7159/api/Employee/upload-image/${employeeId}`,
        formDataImage,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
}


        setSuccess('Registration successful!');
        setTimeout(() => navigate('/'), 2000);

    } catch (err) {
    if (err.response?.data?.message) {
        setError(err.response.data.message);
    } else {
        setError("Registration failed");
    }
}

    
};


    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Employee Registration</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Designation</label>
                            <input
                                type="text"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Department</label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Joining Date</label>
                            <input
                                type="date"
                                name="joiningDate"
                                value={formData.joiningDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Skillset (comma separated)</label>
                        <input
                            type="text"
                            name="skillset"
                            value={formData.skillset}
                            onChange={handleChange}
                            placeholder="e.g., C#, React, SQL"
                        />
                    </div>
                    <div className="form-group">
    <label>Profile Image</label>
    <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files[0])}
    />
</div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Username *</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <button type="submit" className="btn-register">Register</button>
                </form>
                <p className="login-link">
                    Already have an account? <span onClick={() => navigate('/')}>Login</span>
                </p>
            </div>
        </div>
    );

}
export default Register;