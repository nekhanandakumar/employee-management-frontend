import axios from "axios";

const API = axios.create({
    baseURL: "https://localhost:7159/api"
});

// Attach JWT token automatically
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => Promise.reject(error));


// ================= AUTH =================

export const login = async (username, password) => {
    const response = await API.post("/Employee/login", { username, password });
    return response.data;
};

export const register = async (employeeData) => {
    const response = await API.post("/Employee/register", employeeData);
    return response.data;
};


// ================= EMPLOYEE =================

export const getEmployee = async (id) => {
    const response = await API.get(`/Employee/${id}`);
    return response.data;
};

export const getAllEmployees = async () => {
    const response = await API.get("/Employee");
    return response.data;
};

export const updateEmployee = async (id, employeeData, modifiedBy = null) => {
    let url = `/Employee/${id}`;

    if (modifiedBy) {
        url += `?modifiedBy=${encodeURIComponent(modifiedBy)}`;
    }

    const response = await API.put(url, employeeData);
    return response.data;
};

export const deleteEmployee = async (id, modifiedBy = null) => {
    let url = `/Employee/${id}`;

    if (modifiedBy) {
        url += `?modifiedBy=${encodeURIComponent(modifiedBy)}`;
    }

    const response = await API.delete(url);
    return response.data;
};

export const toggleEmployeeStatus = async (id, status) => {
    const response = await API.patch(
        `/Employee/ToggleStatus/${id}`,
        JSON.stringify(status),
        {
            headers: { "Content-Type": "application/json" }
        }
    );

    return response.data;
};

export default API;
