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
        // check for network or server errors
        if (error.response) {
            throw new Error(error.response.data);
        } else if (error.request) {
            // the request was made but no response was received
            throw new Error('No response received from the server.');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error('Error in setting up the request.');
        }
    }
};

export const fetch_allMatchesByUserId = async (userId) => {
    const token = getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/matches/getallmatchesbyuserid/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        return response.data; // array of matches
    } catch (error) {
        // check for network or server errors
        if (error.response) {
            throw new Error(error.response.data);
        } else if (error.request) {
            // the request was made but no response was received
            throw new Error('No response received from the server.');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error('Error in setting up the request.');
        }
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
        // check for network or server errors
        if (error.response) {
            throw new Error(error.response.data);
        } else if (error.request) {
            // the request was made but no response was received
            throw new Error('No response received from the server.');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error('Error in setting up the request.');
        }
    }
};

export const restoreMatch = async (matchId, adminUserId) => {
    const token = getAuthToken();
    try {
        const response = await axios.post(`${API_URL}/matches/restore/${matchId}/${adminUserId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // JWT token
            }
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        // check for network or server errors
        if (error.response) {
            throw new Error(error.response.data);
        } else if (error.request) {
            // the request was made but no response was received
            throw new Error('No response received from the server.');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error('Error in setting up the request.');
        }
    }
};


// for useractivitysummary page
export const fetchUserActivitySummary = async (userId) => {
    const token = getAuthToken();
    try {
    const response = await axios.get(`${API_URL}/matches/summary/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log(response.data)
    return response.data;
} catch (error) {
    // check for network or server errors
    if (error.response) {
        throw new Error(error.response.data);
    } else if (error.request) {
        // the request was made but no response was received
        throw new Error('No response received from the server.');
    } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Error in setting up the request.');
    }
}
};