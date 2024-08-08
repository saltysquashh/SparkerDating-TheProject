import axios from 'axios';

// Function to set the token
export const setAuthToken = (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Function to get the token
export const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Function to remove the token
export const removeAuthToken = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
};
