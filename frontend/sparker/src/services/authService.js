// authService.js
import axios from 'axios';
import { getAuthToken, setAuthToken, removeAuthToken } from '../utilities/authToken';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

// TODO should this be used file even be used? or is it all handled in authcontext

// axios.interceptors.response.use(
//     response => response,
//     error => {
//         if (!error.response) {
//             console.error('Network or server error:', error);
//             removeAuthToken(); 

//             const { logout } = useContext(AuthContext);
//             logout();
//         } else if (error.response.status === 401) {
//             removeAuthToken();
//             const { logout } = useContext(AuthContext);
//             logout();
//         }
//         return Promise.reject(error);
//     }
// );

// export const loginUser = async (credentials) => {
//     const response = await axios.post(`${API_URL}/users/login`, credentials);
//     return response.data; 
// };

// export const logoutUser = () => {
//     removeAuthToken();
//     logout();
// };
