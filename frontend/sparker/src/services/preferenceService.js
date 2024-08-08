//userService.js
import axios from 'axios';
import { removeAuthToken, setAuthToken } from '../utilities/authToken';

const API_URL = process.env.REACT_APP_API_URL;

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response.status === 401) {
            removeAuthToken(); // Clear the token if 401 response
        }
        return Promise.reject(error);
    }
);


export const fetch_UserPreferences = async (userId) => {
    const token = localStorage.getItem('userToken'); // Retrieve the token from local storage or your state management
    try {
        const response = await axios.get(`${API_URL}/preferences/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // Assuming JWT token is used for authentication
            }
        });
        return response.data; // Return the data part of the response
    } catch (error) {
        console.error('Error fetching preferences of user:', error);
        throw error;
    }
};

export const update_UserPreferences = async (userId, preferenceData) => {
    const token = localStorage.getItem('userToken'); // Retrieve the token from local storage
    try {
        console.log(preferenceData);
        const response = await axios.put(`${API_URL}/preferences/${userId}`, preferenceData, {
            headers: {
                'Authorization': `Bearer ${token}` // Assuming JWT token is used for authentication
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating preferences of user:', error);
        throw error;
    }
};