//userService.js
import axios from 'axios';
import { removeAuthToken, setAuthToken } from '../utilities/authToken';

const API_URL = process.env.REACT_APP_API_URL;



export const registerUser = async (userData) => {
    // return await axios.post(`${API_URL}/users/register`, userData);

        try {
            const response = await axios.post(`${API_URL}/users/register`, userData);
            return response.data;
        } catch (error) {
            // Check for network or server errors
            if (!error.response) {
                // Network error
                throw new Error('Unable to reach the server.');
            } else {
                // Other errors
                throw error;
            }
        }
    
};

export const loginUser = async (credentials) => {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    return response;
};

export const fetch_UserInfo = async (userId) => {
    const token = localStorage.getItem('userToken'); // Retrieve the token from local storage or your state management
    try {
        const response = await axios.get(`${API_URL}/users/userinfo/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // Assuming JWT token is used for authentication
            }
        });
        return response.data; // Return the data part of the response
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

export const fetch_ShowcaseUser = async (userId) => {
    const token = localStorage.getItem('userToken'); // Retrieve the token from local storage or your state management
    try {
        const response = await axios.get(`${API_URL}/users/showcaseuser/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // Assuming JWT token is used for authentication
            }
        });
        return response.data; // Return the data part of the response
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};
   
export const update_UserInfo = async (userId, userData) => {
    const token = localStorage.getItem('userToken'); // Retrieve the token from local storage
    try {
        console.log(userData);
        const response = await axios.put(`${API_URL}/users/userinfo/${userId}`, userData, {
            headers: {
                'Authorization': `Bearer ${token}` // Assuming JWT token is used for authentication
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating user info:', error);
        throw error;
    }
};


export const fetch_UserCustomization = async (userId) => {
    const token = localStorage.getItem('userToken'); // Retrieve the token from local storage or your state management
    try {
        const response = await axios.get(`${API_URL}/users/usercustomization/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // Assuming JWT token is used for authentication
            }
        });
        return response.data; // Return the data part of the response
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};


export const update_UserBio = async (userId, bioData) => {
    const token = localStorage.getItem('userToken'); // Retrieve the token from local storage
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

// Function to fetch the next swipe user
export const fetchNextUserToSwipe = async (userId) => {
    const token = localStorage.getItem('userToken'); // Retrieve the token from local storage
    try {
        const response = await axios.get(`${API_URL}/users/nextswipeuser/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // Assuming JWT token is used for authentication
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching next swipe user:', error);
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

export const checkEmailExists = async (email) => {
    try {
        const response = await axios.get(`${API_URL}/users/useremailexists/${email}`)
        console.log('Raw response in service: ' + response.data)
        return response.data; // Assuming the backend returns { exists: true/false }
    } catch (error) {
        throw new Error('Failed to check email');
    }
};

export const fetchUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users/all`);
        return response.data; // Assuming the API returns an array of users
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const deleteUser = async (delUserId, byUserId) => {
    try {
        const response = await axios.delete(`${API_URL}/users/delete/${delUserId}/${byUserId}`);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error.response.data); // use error.response.data in all services?
        throw error;
    }
};

export const promoteUserToAdmin = async (userId, byUserId) => {
    try {
        const response = await axios.post(`${API_URL}/users/promote/${userId}/${byUserId}`);
        return response.data;
    } catch (error) {
        console.error('Error promoting user:', error.response.data);
        throw error;
    }
};

export const demoteAdminToUser = async (adminUserId, byUserId) => {
    try {
        const response = await axios.post(`${API_URL}/users/demote/${adminUserId}/${byUserId}`);
        return response.data;
    } catch (error) {
        console.error('Error demoting admin:', error.response.data);
        throw error;
    }
};