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

export const fetchSwipeDetails = async (swipedId, swiperId) => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/swipes/swipedetails/${swipedId}/${swiperId}`, {
        headers: {
            'Authorization': `Bearer ${token}` // JWT token
        }
    });
    // console.log(response.data.swipe);
    return response.data; // includes swipe object, match object and info of swiped user
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