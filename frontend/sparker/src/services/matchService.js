// matchService.js
import axios from 'axios';
import { getAuthToken, setAuthToken, removeAuthToken } from '../utilities/authToken';

const API_URL = process.env.REACT_APP_API_URL;

export const getMatchById = async (matchId, userId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/matches/matchbyid/${matchId}/byuserid/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching match:', error);
        throw error;
    }
};

export const getAllMatchesByUserId = async (userId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/matches/getallmatchesbyuserid/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data; // array of matches
    } catch (error) {
        console.error('Error fetching matches:', error);
        throw error;
    }
};


export const deleteMatch = async (matchId, userId) => {
    const token = getAuthToken();
    try {
        const response = await axios.delete(`${API_URL}/matches/delete/${matchId}/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error deleting match:', error);
        throw error;
    }
};


export const restoreMatch = async (matchId) => {
    const token = getAuthToken();
    try {
        const response = await axios.post(`${API_URL}/matches/restore/${matchId}`, {}, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error restoring match:', error);
        throw error;
    }
};