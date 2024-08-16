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

    const response = await axios.post(`${API_URL}/images/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        },
    });

    return response.data;
};

export const deleteImage = async (imageId) => {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/images/${imageId}`, {
        headers: {
            'Authorization': `Bearer ${token}` // JWT token
        }
    });
};
