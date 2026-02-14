import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployee, updateEmployee } from '../services/api';
import axios from 'axios'; // We need axios for the multipart/form-data upload
import './EmployeeDashboard.css';

function EmployeeDashboard() {
    const [employee, setEmployee] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null); // ✅ Tracks the new image
    const [previewImage, setPreviewImage] = useState(null); // ✅ Tracks local preview
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            navigate('/');
            return;
        }
        fetchEmployeeData(user.employeeID);
    }, [navigate]);

    const fetchEmployeeData = async (id) => {
        try {
            const data = await getEmployee(id);
            setEmployee(data);
            setFormData(data);
            // ✅ Set the initial preview to the Base64 string from the database
            setPreviewImage(data.profileImage); 
        } catch (err) {
            console.error('Error fetching employee data:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // ✅ Handle file selection and create a local preview
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file)); // Show preview instantly
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setMessage('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(employee);
        setPreviewImage(employee.profileImage); // Reset preview to original
        setSelectedFile(null); // Clear selected file
        setMessage('');
    };

    const handleSave = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const updateData = {
                ...formData,
                modifiedBy: user.username
            };
            
            setMessage('Saving changes...');

            // 1. Update the text data
            await updateEmployee(employee.employeeID, updateData);

            // 2. ✅ If a new file was selected, upload it separately
            if (selectedFile) {
                const imageFormData = new FormData();
                imageFormData.append('file', selectedFile); // Must match C# parameter 'file'

                await axios.post(
                    `https://localhost:7159/api/Employee/upload-image/${employee.employeeID}`,
                    imageFormData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            setMessage('Profile updated successfully!');
            setIsEditing(false);
            setSelectedFile(null);
            
            // Re-fetch to get the latest data (including the new Base64 string if updated)
            fetchEmployeeData(employee.employeeID); 
            
        } catch (err) {
            console.error(err);
            setMessage('Error updating profile');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    // ✅ Helper to format the Base64 string for the <img> tag
    const getImageSource = () => {
        if (!previewImage) return "/default-avatar.png";
        // If it's a local object URL (preview), use it directly
        if (previewImage.startsWith('blob:')) return previewImage;
        // If it's a Base64 string from the API, add the data URI prefix
        if (!previewImage.startsWith('data:image')) return `data:image/jpeg;base64,${previewImage}`;
        return previewImage;
    };

    if (!employee) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="employee-dashboard">
            <div className="dashboard-header">
                <h1>Employee Dashboard</h1>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>

            <div className="profile-container">
                <h2>My Profile</h2>
                
                <div className="profile-image-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                    <img
                        src={getImageSource()}
                        alt="Profile"
                        className="profile-image"
                        style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }}
                    />
                    {/* ✅ Show file upload input only when editing */}
                    {isEditing && (
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            style={{ marginTop: '10px' }}
                        />
                    )}
                </div>

                {message && <div className="message">{message}</div>}

                <div className="profile-content">
                    {/* ... (Your existing profile-row and profile-field JSX remains exactly the same below here) ... */}
                    <div className="profile-row">
                        <div className="profile-field">
                            <label>Employee ID</label>
                            <input type="text" value={employee.employeeID} disabled />
                        </div>
                        <div className="profile-field">
                            <label>Username</label>
                            <input type="text" value={employee.username} disabled />
                        </div>
                    </div>

                    <div className="profile-row">
                        <div className="profile-field">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="profile-field">
                            <label>Designation</label>
                            <input
                                type="text"
                                name="designation"
                                value={formData.designation || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="profile-field">
                        <label>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="profile-row">
                        <div className="profile-field">
                            <label>Department</label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="profile-field">
                            <label>Joining Date</label>
                            <input
                                type="date"
                                name="joiningDate"
                                value={formData.joiningDate ? formData.joiningDate.split('T')[0] : ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="profile-field">
                        <label>Skillset</label>
                        <input
                            type="text"
                            name="skillset"
                            value={formData.skillset || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="profile-row">
                        <div className="profile-field">
                            <label>Status</label>
                            <input type="text" value={employee.status} disabled />
                        </div>
                        <div className="profile-field">
                            <label>Role</label>
                            <input type="text" value={employee.role} disabled />
                        </div>
                    </div>

                    <div className="button-group">
                        {!isEditing ? (
                            <button onClick={handleEdit} className="btn-edit">Edit Profile</button>
                        ) : (
                            <>
                                <button onClick={handleSave} className="btn-save">Save Changes</button>
                                <button onClick={handleCancel} className="btn-cancel">Cancel</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeDashboard;