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

export const fetch_userInfo = async (userId) => {
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

export const fetch_swipeUserById = async (userId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/users/swipeuserbyid/${userId}`, {
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
   
export const update_userInfo = async (userId, userData) => {
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


export const fetch_userCustomization = async (userId) => {
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


export const update_userBio = async (userId, newBio) => {
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

// get the next user, that a user should swipe on
export const fetch_nextUserToSwipe = async (userId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/users/getnextswipeuser/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching next user to swipe on:', error);
        throw error;
    }
};

export const fetch_checkEmailExists = async (email) => {
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

export const fetch_allUsers = async () => {
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

export const delete_user = async (delUserId, byUserId) => {
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

export const post_promoteUserToAdmin = async (userId, byUserId) => {
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

export const post_demoteAdminToUser = async (adminUserId, byUserId) => {
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