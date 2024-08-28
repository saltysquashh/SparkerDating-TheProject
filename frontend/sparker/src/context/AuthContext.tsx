import React, {
	createContext,
	useState,
	ReactNode,
	useEffect,
	useContext,
} from "react";
import {
	removeAuthToken,
	setAuthToken,
	getAuthToken,
} from "../utilities/authToken";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthUserType } from "../components/providers/authProvider";

// define AuthContextType
type AuthContextType = {
	authUser: AuthUserType | null; // use AuthUserType in defining the AuthContext
	login: (credentials: { email: string; password: string }) => Promise<void>;
	logout: () => void;
};

// create context
export const AuthContext = createContext<AuthContextType>(null!);
