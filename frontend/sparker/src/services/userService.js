//userService.js
import axios from 'axios';
import { getAuthToken, setAuthToken, removeAuthToken } from '../utilities/authToken';

const API_URL = process.env.REACT_APP_API_URL;


export const registerUser = async (userData) => {
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

export const fetch_UserInfo = async (userId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/users/userinfo/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data; // Return the data part of the response
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

export const fetch_ShowcaseUser = async (userId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/users/showcaseuser/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data; // Return the data part of the response
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};
   
export const update_UserInfo = async (userId, userData) => {
    const token = getAuthToken();
    try {
        console.log(userData);
        const response = await axios.put(`${API_URL}/users/userinfo/${userId}`, userData, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating user info:', error);
        throw error;
    }
};


export const fetch_UserCustomization = async (userId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/users/usercustomization/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};


export const update_UserBio = async (userId, newBio) => {
    const token = getAuthToken();
    try {
        const response = await axios.put(`${API_URL}/users/userbio/${userId}/${newBio}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.data)
        {
            alert('The bio was not saved, as it was unchanged.')
        }
        else
        {
            alert('Bio updated successfully');
        }
        return response.data;
    } catch (error) {
        console.error('Error updating user info:', error);
        throw error;
    }
};

export const fetchNextUserToSwipe = async (userId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/users/nextswipeuser/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching next swipe user:', error);
        throw error;
    }
};

export const checkEmailExists = async (email) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/users/useremailexists/${email}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data; //
    } catch (error) {
        throw new Error('Failed to check email');
    }
};

export const fetchUsers = async () => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/users/all`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data; // Assuming the API returns an array of users
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const deleteUser = async (delUserId, byUserId) => {
    const token = getAuthToken();
    try {
        const response = await axios.delete(`${API_URL}/users/delete/${delUserId}/${byUserId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error.response.data);
        throw error;
    }
};

export const promoteUserToAdmin = async (userId, byUserId) => {
    const token = getAuthToken();
    try {
        const response = await axios.post(`${API_URL}/users/promote/${userId}/${byUserId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error promoting user:', error.response.data);
        throw error;
    }
};

export const demoteAdminToUser = async (adminUserId, byUserId) => {
    const token = getAuthToken();
    try {
        const response = await axios.post(`${API_URL}/users/demote/${adminUserId}/${byUserId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error demoting admin:', error.response.data);
        throw error;
    }
};