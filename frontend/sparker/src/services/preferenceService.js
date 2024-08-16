//userService.js
import axios from 'axios';
import { getAuthToken, setAuthToken, removeAuthToken } from '../utilities/authToken';

const API_URL = process.env.REACT_APP_API_URL;



export const fetch_UserPreferences = async (userId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/preferences/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data; // Return the data part of the response
    } catch (error) {
        console.error('Error fetching preferences of user:', error);
        throw error;
    }
};

export const update_UserPreferences = async (userId, preferenceData) => {
    const token = getAuthToken();
    try {
        console.log(preferenceData);
        const response = await axios.put(`${API_URL}/preferences/${userId}`, preferenceData, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating preferences of user:', error);
        throw error;
    }
};