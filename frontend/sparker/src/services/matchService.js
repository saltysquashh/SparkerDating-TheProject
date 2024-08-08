// matchService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchUserMatches = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/matches/get/${userId}`);
        return response.data; // array of matches
    } catch (error) {
        console.error('Error fetching matches:', error);
        throw error;
    }
};


export const deleteMatch = async (matchId, userId) => {
    try {
        const response = await axios.delete(`${API_URL}/matches/delete/${matchId}/${userId}`);
        console.log(response.data);
    } catch (error) {
        console.error('Error deleting match:', error);
        throw error;
    }
};