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
            Liked: liked}, 
            {
                headers: {
                'Authorization': `Bearer ${token}` // Assuming JWT token is used for authentication
            }
        });

        if (response.ok) {
            // Parse the JSON response to get the SwipeResponseDTO
            const result = await response.json();

            // Decode the DTO (essentially, just access its properties)
            const isMatch = result.isMatch;
            const message = result.message;

            // Use the data (e.g., display the message to the user)
            alert(message); // This will show the message in an alert box
        } else {
            // Handle HTTP errors
            alert("Something went wrong, please try again.");
        }

    } catch (error) {
        console.error('Error during swipe action:', error);
        throw error;
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