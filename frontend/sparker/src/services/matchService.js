// matchService.js
import axios from 'axios';
import { getAuthToken, setAuthToken, removeAuthToken } from '../utilities/authToken';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchMatch = async (matchId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/matches/matchbyid/${matchId}`, {
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

export const fetchMatchByUsers = async (swiperId, swipedId) => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/matches/matchbyusers/${swiperId}/${swipedId}`, {
        headers: {
            'Authorization': `Bearer ${token}` // JWT token
        }
    });
    console.log(response.data);
    return response.data;
};

export const fetchUserMatches = async (userId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/matches/matchesbyuserid/${userId}`, {
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