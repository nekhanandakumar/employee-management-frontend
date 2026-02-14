import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEmployees, updateEmployee } from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'Admin') {
            navigate('/');
            return;
        }
        fetchAllEmployees();
    }, [navigate]);

    useEffect(() => {
        const filtered = employees.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEmployees(filtered);
        // reset to first page when filter changes
        setCurrentPage(1);
    }, [searchTerm, employees]);

    const fetchAllEmployees = async () => {
        try {
            const data = await getAllEmployees();
            setEmployees(data);
            setFilteredEmployees(data);
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee.employeeID);
        setFormData(employee);
        setMessage('');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (user.role !== 'Admin') {
                setMessage('Error: Admin access required to update employees');
                return;
            }

            // Send only fields that the backend stored procedure expects
            const updateData = {
                name: formData.name || '',
                designation: formData.designation || '',
                address: formData.address || '',
                department: formData.department || '',
                joiningDate: formData.joiningDate || null,
                skillset: formData.skillset || '',
                status: formData.status || 'Active'
            };

            

            console.log('Sending update data:', updateData);
            
            await updateEmployee(editingEmployee, updateData, user.username);
            setMessage('Employee updated successfully!');
            setEditingEmployee(null);
            fetchAllEmployees();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Update error:', err);
            console.error('Error response:', err.response);
            
            let errorMsg = 'Unknown error';
        
            if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.response?.data?.errors) {
                const errors = err.response.data.errors;
                const errorList = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`);
                errorMsg = errorList.join(' | ');
            } else if (err.response?.data) {
                errorMsg = typeof err.response.data === 'string' 
                    ? err.response.data 
                    : JSON.stringify(err.response.data);
            } else if (err.message) {
                errorMsg = err.message;
            }
            
            console.error('Extracted error message:', errorMsg);
            setMessage(`Error updating employee: ${errorMsg}`);
        }
    };
    const handleStatusToggle = async (emp) => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'Admin') return;

        const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';

        // 1️⃣ Update UI instantly
        const updatedEmployees = employees.map(e =>
            e.employeeID === emp.employeeID
                ? { ...e, status: newStatus }
                : e
        );

        setEmployees(updatedEmployees);

        // 2️⃣ Update backend
        await updateEmployee(emp.employeeID, { status: newStatus }, user.username);

    } catch (err) {
        console.error("Status update failed:", err);
        fetchAllEmployees(); // reload if error
    }
};


    const handleCancel = () => {
        setEditingEmployee(null);
        setFormData({});
        setMessage('');
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + pageSize);
    const showingFrom = filteredEmployees.length === 0 ? 0 : startIndex + 1;
    const showingTo = Math.min(filteredEmployees.length, startIndex + pageSize);

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>

            {message && <div className="message">{message}</div>}

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by name, username, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="table-container">
                <table className="employee-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Designation</th>
                            <th>Department</th>
                            <th>Joining Date</th>
                            <th>Skillset</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEmployees.map(emp => (
                            editingEmployee === emp.employeeID ? (
                                <tr key={emp.employeeID} className="editing-row">
                                    <td>{emp.employeeID}</td>
                                    <td>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name || ''}
                                            onChange={handleChange}
                                        />
                                    </td>
                                    <td>{emp.username}</td>
                                    <td>
                                        <input
                                            type="text"
                                            name="designation"
                                            value={formData.designation || ''}
                                            onChange={handleChange}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department || ''}
                                            onChange={handleChange}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="date"
                                            name="joiningDate"
                                            value={formData.joiningDate ? formData.joiningDate.split('T')[0] : ''}
                                            onChange={handleChange}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="skillset"
                                            value={formData.skillset || ''}
                                            onChange={handleChange}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            name="status"
                                            value={formData.status || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button onClick={handleSave} className="btn-save-small">Save</button>
                                        <button onClick={handleCancel} className="btn-cancel-small">Cancel</button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={emp.employeeID}>
                                    <td>{emp.employeeID}</td>
                                    <td>{emp.name}</td>
                                    <td>{emp.username}</td>
                                    <td>{emp.designation || '-'}</td>
                                    <td>{emp.department || '-'}</td>
                                    <td>{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '-'}</td>
                                    <td>{emp.skillset || '-'}</td>
                                    <td>
    <label className="switch">
        <input
            type="checkbox"
            checked={emp.status === 'Active'}
            onChange={() => handleStatusToggle(emp)}
        />
        <span className="slider"></span>
    </label>
</td>

                                    <td>
                                        <button onClick={() => handleEdit(emp)} className="btn-edit-small"><i class="bi bi-pencil-square"></i>
</button>
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>

                <div className="table-footer">
                    <div className="table-info">Showing {showingFrom}-{showingTo} of {filteredEmployees.length}</div>
                    <div className="pagination">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="page-btn">Prev</button>
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => handlePageChange(idx + 1)}
                                className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}>
                                {idx + 1}
                            </button>
                        ))}
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="page-btn">Next</button>
                    </div>
                </div>

                {filteredEmployees.length === 0 && (
                    <div className="no-data">No employees found</div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;