import axios from 'axios';

const API_URL = 'https://localhost:7159/api/Employee'; 

// Add interceptor to include token and role in all requests
axios.interceptors.request.use((config) => {
    const user = localStorage.getItem('user');
    if (user) {
        const userData = JSON.parse(user);
        if (userData.token) {
            config.headers.Authorization = `Bearer ${userData.token}`;
        }
        // Add X-User-Role header if user has a role
        if (userData.role) {
            config.headers['X-User-Role'] = userData.role;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
};

export const register = async (employeeData) => {
    const response = await axios.post(`${API_URL}/register`, employeeData);
    return response.data;
};

export const getEmployee = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const getAllEmployees = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const updateEmployee = async (id, employeeData, modifiedBy = null) => {
    // If API_URL already has '/Employee', just add the ID
    // If API_URL is just '.../api', use `${API_URL}/Employee/${id}`
    let url = `${API_URL}/${id}`; 
    
    if (modifiedBy) {
        url += `?modifiedBy=${encodeURIComponent(modifiedBy)}`;
    }
    // Normalize payload to match stored procedure parameters
    const payload = { ...employeeData };
    if (payload.joiningDate) {
        try {
            // If it's an ISO datetime string, take date part
            if (typeof payload.joiningDate === 'string') {
                payload.joiningDate = payload.joiningDate.split('T')[0];
            } else if (payload.joiningDate instanceof Date) {
                payload.joiningDate = payload.joiningDate.toISOString().split('T')[0];
            }
        } catch (e) {
            // leave as-is on error
        }
    } else {
        payload.joiningDate = null;
    }

    console.log('UpdateEmployee - Final URL:', url);
    console.log('UpdateEmployee - Payload:', payload);

    const response = await axios.put(url, payload, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const deleteEmployee = async (id, modifiedBy = null) => {
    let url = `${API_URL}/${id}`;
    if (modifiedBy) {
        url += `?modifiedBy=${encodeURIComponent(modifiedBy)}`;
    }
    const response = await axios.delete(url);
    return response.data;
};