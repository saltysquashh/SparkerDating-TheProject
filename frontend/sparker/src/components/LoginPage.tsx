// LoginPage.tsx
import React, { useState, ChangeEvent, FormEvent, useContext } from 'react';
import '../styles/LoginPage.css';
import { loginUser } from '../services/userService'; 
import axios, { AxiosError } from 'axios';
import UserType from '../interfaces/UserInterface';
import { AuthContext } from '../context/AuthContext';
import '../styles/ProfilePage.css';
import { setAuthToken } from '../utilities/authToken';

const LoginPage = () => {

    const [user, setUser] = useState<UserType | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

// In your login component
    const { login } = useContext(AuthContext);


    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await loginUser({
                email: formData.email,
                password: formData.password,
            });
    
            const { token, ...userData } = response.data;
            setAuthToken(token); // Store the token in Axios headers and localStorage
    
            login(userData); // Update the user context
            alert('Login successful');
            // Optionally, navigate the user to a different page or update the state
              
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Handle Axios error
                if (error.response) {
                    alert('Login failed: ' + error.response.data.message);
                } else {
                    alert('Request made but no response received');
                }
            } else if (error instanceof Error) {
                // Handle generic error
                alert('Error: ' + error.message);
            } else {
                // Handle unknown errors
                alert('An unknown error occurred');
            }
        }
    };

return (
  <div className="form-container">
      <div className="login-container">
          <h1>Login Page</h1>
          {user ? (
          <p>Welcome, {user.firstName}!</p> // TypeScript now knows about user.firstName
          ) : (
              <form onSubmit={handleLogin}>
                  <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      onChange={handleChange}
                      value={formData.email}
                      required
                  />
                  <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      onChange={handleChange}
                      value={formData.password}
                      required
                  />
                  <button type="submit">Login</button>
              </form>
          )}
      </div>
  </div>
);
};

export default LoginPage;
