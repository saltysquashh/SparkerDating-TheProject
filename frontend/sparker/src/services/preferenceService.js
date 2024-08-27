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
        // check for network or server errors
        if (error.response) {
            throw new Error(error.response.data);
        } else if (error.request) {
            // the request was made but no response was received
            throw new Error('No response received from the server.');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error('Error in setting up the request.');
        }
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
        // check for network or server errors
        if (error.response) {
            throw new Error(error.response.data);
        } else if (error.request) {
            // the request was made but no response was received
            throw new Error('No response received from the server.');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error('Error in setting up the request.');
        }
    }
};