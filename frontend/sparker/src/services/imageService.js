// imageService.js
import axios from 'axios';
import { getAuthToken, setAuthToken, removeAuthToken } from '../utilities/authToken';

const API_URL = process.env.REACT_APP_API_URL;


export const fetchUserImages = async (userId) => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/images/user/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}` // JWT token
        }
    });
    return response.data;
};

export const uploadImage = async (file, userId) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId); 

    try {
    const response = await axios.post(`${API_URL}/images/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        },
       
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

export const deleteImage = async (imageId) => {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/images/${imageId}`, {
        headers: {
            'Authorization': `Bearer ${token}` // JWT token
        }
    });
};
