// AuthContext.tsx
import React, { createContext, useState, ReactNode } from 'react';
import { removeAuthToken, setAuthToken } from '../utilities/authToken';
import { useNavigate } from 'react-router-dom';


type UserType = {
    id: number; // was string? aug 12
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    isMaster: boolean;
};

type AuthContextType = {
    user: UserType | null;
    login: (userData: UserType) => void; // Include userId in the login function
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType>(null!);

type AuthProviderProps = {
    children: ReactNode;
};


export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<UserType | null>(null);
    const navigate = useNavigate(); // Use the useNavigate hook
    
    const login = (userData: UserType) => {
        setUser(userData);
    };
    // const navigate = useNavigate();
    const logout = () => {
        setUser(null);
        alert("You have been logged out."); // Display the alert message
        navigate('/'); // Navigate to the homepage
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};



