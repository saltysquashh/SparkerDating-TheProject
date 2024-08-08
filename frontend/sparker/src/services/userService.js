//userService.js
import axios from 'axios';
import { removeAuthToken, setAuthToken } from '../utilities/authToken';

const API_URL = process.env.REACT_APP_API_URL; // Base URL from .env file



export const registerUser = async (userData) => {
    return await axios.post(`${API_URL}/users/register`, userData);
};

export const loginUser = async (credentials) => {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    // console.log('Response:', response.data);
    return response;
};

export const fetch_UserInfo = async (userId) => {
    const token = localStorage.getItem('userToken'); 
    try {
        const response = await axios.get(`${API_URL}/users/userinfo/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token is used for authentication
            }
        });
        return response.data; // Return the data part of the response
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};
   
export const update_UserInfo = async (userId, userData) => {
    const token = localStorage.getItem('userToken');
    try {
        console.log(userData);
        const response = await axios.put(`${API_URL}/users/userinfo/${userId}`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating user info:', error);
        throw error;
    }
};


export const fetch_UserBio = async (userId) => {
    const token = localStorage.getItem('userToken');
    try {
        const response = await axios.get(`${API_URL}/users/userbio/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};


export const update_UserBio = async (userId, bioData) => {
    const token = localStorage.getItem('userToken');
    try {
        console.log(bioData);
        const response = await axios.put(`${API_URL}/users/userbio/${userId}`, bioData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating user info:', error);
        throw error;
    }
};

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response.status === 401) {
            removeAuthToken(); // Clear the token if 401 response
        }
        return Promise.reject(error);
    }
);
    