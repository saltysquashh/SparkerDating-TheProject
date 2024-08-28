import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { removeAuthToken, setAuthToken, getAuthToken } from '../utilities/authToken';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthUserType } from '../components/providers/authProvider';

// define AuthUserType
// type AuthUserType = {
//     id: number;
//     firstName: string;
//     lastName: string;
//     isAdmin: boolean;
//     isMaster: boolean;
// };

// define AuthContextType
type AuthContextType = {
    authUser: AuthUserType | null; // use AuthUserType in defining the AuthContext
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => void;
};

// create context
export const AuthContext = createContext<AuthContextType>(null!);

// type AuthProviderProps = {
//     children: ReactNode;
// };

// export const AuthProvider = ({ children }: AuthProviderProps) => {
//     const [authUser, setAuthUser] = useState<AuthUserType | null>(null);
//     const navigate = useNavigate();
//     const API_URL = process.env.REACT_APP_API_URL;
    
//     // login API call
//     const login = async (credentials: { email: string; password: string }) => {
//         try {
//             const response = await axios.post(`${API_URL}/authorization/login`, credentials); 
//             const { token, ...userData } = response.data;
//             setAuthUser(userData);
//             setAuthToken(token); // set token in localStorage and axios
//             navigate('/');
//         } catch (error) {
//             console.error('Login failed:', error);
//             throw error;
//         }
//     };

//     // log user out
//     const logout = () => {
//         setAuthUser(null);
//         removeAuthToken();
//         navigate('/login');
//     };

//      // Effect that runs when the component is first rendered. ItChecks for existing token and sets up response interceptor
//     useEffect(() => {
//         axios.interceptors.response.use(
//             response => response,
//             error => {
//                 if (!error.response || error.response.status === 401) {
//                     logout(); // call logout if token is invalid or missing
//                 }
//                 return Promise.reject(error);
//             }
//         );
    
//         const token = getAuthToken(); // retrieve the token from localStorage
//         if (token) {
//             axios.get(`${API_URL}/authorization/userinfobytoken`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             }).then(response => {
//                 setAuthUser(response.data);
//                 setAuthToken(token); // Ensure token is set in headers
//             }).catch(() => {
//                 removeAuthToken(); // if invalid, remove
//                 logout();
//             });
//         }
//     }, []);

//     return (
//         // provide access to context values and methods (of AuthContext), in child components - AuthProviderProps
//         // login used on loginpage, logout in header
//         <AuthContext.Provider value={{ authUser, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };