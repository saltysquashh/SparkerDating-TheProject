// swipeActionService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// the function to create a swipe
export const sendSwipeAction = async (swiperUserId, swipedUserId, liked) => {
    const token = localStorage.getItem('userToken'); // Retrieve the token from local storage
    try {
        const response = await axios.post(`${API_URL}/swipes/swipe`, {
            SwiperUserId: swiperUserId,
            SwipedUserId: swipedUserId,
            Liked: liked
        }, {
            headers: {
                'Authorization': `Bearer ${token}` // Assuming JWT token is used for authentication
            }
        });

        // Handle the response (since Axios does not use `response.ok`)
        const { isMatch, message } = response.data;

        return message;

    } catch (error) {
        // Handle errors
        console.error('Error during swipe action:', error);
        alert('Error during swipe action:', error);
    }
};

export const fetchSwipesByUser = async (userId) => {
    const token = localStorage.getItem('userToken'); // Retrieve the token from local storage
    try {
        const response = await axios.get(`${API_URL}/swipes/getswipesbyuser/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // Assuming JWT token is used for authentication
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching swipes:', error);
        throw error;
    }
};

export const deleteSwipe = async (swipeId) => {
    try {
        const response = await axios.delete(`${API_URL}/swipes/delete/${swipeId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting match:', error);
        throw error;
    }
};

// // Function to fetch the next swipe user
// export const fetchNextSwipeUser = async (userId) => {
//     const token = localStorage.getItem('userToken'); // Retrieve the token from local storage
//     try {
//         const response = await axios.get(`${API_URL}/swipes/nextswipeuser/${userId}`, {
//             headers: {
//                 'Authorization': `Bearer ${token}` // Assuming JWT token is used for authentication
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching next swipe user:', error);
//         throw error;
//     }
// };

// Handle Axios response and error globally (optional, based on your preference)
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Handle 401 error globally if needed
        }
        return Promise.reject(error);
    }
);

// Export other functions as needed