// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Store auth token
let authToken = localStorage.getItem('skillgap_token');

// Set auth token
export const setAuthToken = (token) => {
    authToken = token;
    localStorage.setItem('skillgap_token', token);
};

// Get auth token
export const getAuthToken = () => {
    return authToken;
};

// Remove auth token (logout)
export const removeAuthToken = () => {
    authToken = null;
    localStorage.removeItem('skillgap_token');
    localStorage.removeItem('skillgap_user');
};

// Get headers with auth token
const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
};

// API Helper function
const apiRequest = async (endpoint, method = 'GET', data = null) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: getHeaders()
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Auth API
export const authAPI = {
    register: (userData) => apiRequest('/auth/register', 'POST', userData),
    login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
    getProfile: () => apiRequest('/auth/profile', 'GET'),
    updateProfile: (data) => apiRequest('/auth/profile', 'PUT', data)
};

// Skills API
export const skillsAPI = {
    getSkills: () => apiRequest('/skills', 'GET'),
    addSkill: (skillData) => apiRequest('/skills', 'POST', skillData),
    deleteSkill: (skillName) => apiRequest(`/skills/${skillName}`, 'DELETE'),
    getTargetJob: () => apiRequest('/skills/target-job', 'GET'),
    setTargetJob: (jobData) => apiRequest('/skills/target-job', 'POST', jobData)
};

// Gap Analysis API
export const gapsAPI = {
    analyze: () => apiRequest('/gaps/analyze', 'GET'),
    getHistory: () => apiRequest('/gaps/history', 'GET')
};

// Check if user is logged in
export const isAuthenticated = () => {
    return !!authToken;
};

// Get stored user data
export const getUserData = () => {
    const userData = localStorage.getItem('skillgap_user');
    return userData ? JSON.parse(userData) : null;
};

// Set user data
export const setUserData = (user) => {
    localStorage.setItem('skillgap_user', JSON.stringify(user));
};