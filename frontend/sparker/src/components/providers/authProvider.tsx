import React, { useState, ReactNode, useEffect } from 'react';


import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { setAuthToken, removeAuthToken, getAuthToken } from '../../utilities/authToken';

export type AuthUserType = {
    id: number;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    isMaster: boolean;
};

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [authUser, setAuthUser] = useState<AuthUserType | null>(null);
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    // LOGIN AND LOGOUT FUNCTIONS
    // log the user in - API call
    const login = async (credentials: { email: string; password: string }) => {
        try {
            // call login endpoint, which generates  token for the user
            const response = await axios.post(`${API_URL}/authentication/login`, credentials);
            const { token, ...userData } = response.data;

            setAuthUser(userData);
            setAuthToken(token); // set token in localStorage and axios
            console.log('User is now authenticated.');
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };
    // log the user out
    const logout = () => {
        setAuthUser(null);
        removeAuthToken();
        navigate('/login');
        console.log('User is now unauthenticated.');
    };

    // runs when the component is first rendered and checks for existing token and sets up response interceptor
    useEffect(() => {
        axios.interceptors.response.use(
            response => response,
            error => {
                if (!error.response || error.response.status === 401) {
                    logout(); // call logout if token is invalid or missing
                }
                return Promise.reject(error);
            }
        );

        const token = getAuthToken(); // retrieve the token from localStorage
        if (token) {
            axios.get(`${API_URL}/authorization/userinfobytoken`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(response => {
                setAuthUser(response.data);
                setAuthToken(token); // Ensure token is set in headers
            }).catch(() => {
                removeAuthToken(); // if invalid, remove
                logout();
            });
        }
    }, []);

    return (
        // provide access to context values and methods (of AuthContext), in child components
        // login used on loginpage, logout in header
        <AuthContext.Provider value={{ authUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
