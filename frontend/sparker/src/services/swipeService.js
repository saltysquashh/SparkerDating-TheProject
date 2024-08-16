// swipeActionService.js
import axios from 'axios';
import { getAuthToken, setAuthToken, removeAuthToken } from '../utilities/authToken';

const API_URL = process.env.REACT_APP_API_URL;

// the function to create a swipe
export const createSwipe = async (swiperUserId, swipedUserId, liked) => {
    const token = getAuthToken();
    try {
        const response = await axios.post(`${API_URL}/swipes/swipe`, {
            SwiperUserId: swiperUserId,
            SwipedUserId: swipedUserId,
            Liked: liked
        }, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });

        // Handle the response (since Axios does not use `response.ok`)
        const { isMatch, message } = response.data;

        if (isMatch)
        {
            alert(message);
        }

        return true;

    } catch (error) {

        alert('Error during swipe action:', error);

        return false;
    }
};

export const fetchSwipesByUser = async (userId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/swipes/getswipesbyuser/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching swipes:', error);
        throw error;
    }
};

export const deleteSwipe = async (swipeId) => {
    const token = getAuthToken();
    try {
        const response = await axios.delete(`${API_URL}/swipes/delete/${swipeId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting match:', error);
        throw error;
    }
};


axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Handle 401 error globally if needed
        }
        return Promise.reject(error);
    }
);