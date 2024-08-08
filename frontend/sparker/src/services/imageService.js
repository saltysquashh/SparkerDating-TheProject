// imageService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// export const fetchAllImages = async () => {
//     // Replace with the correct endpoint
//     const response = await axios.get(`${API_URL}/images`);
//     return response.data;
// };

export const fetchUserImages = async (userId) => {
    const response = await axios.get(`${API_URL}/images/user/${userId}`);
    return response.data;
};

export const uploadImage = async (file, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId); // Add userId to the FormData

    const response = await axios.post(`${API_URL}/images/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const deleteImage = async (imageId) => {
    // Replace with the correct endpoint
    await axios.delete(`${API_URL}/images/${imageId}`);
};
