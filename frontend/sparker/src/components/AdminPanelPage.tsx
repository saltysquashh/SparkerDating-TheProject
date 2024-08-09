import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/AdminPanelPage.css';

const AdminPanelPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {

        if (!user) {
            // Redirect to login page or any other page
            alert('You are not logged in.');
            navigate('/login');
        }

        if (!user?.isAdmin) {
            alert('Unauthorized.');
            navigate('/');
        }
        
    }, [user, navigate]);

    if (!user) {
        return <div>Loading...</div>; // Show loading or redirect until user is validated
    }

    return (
        <div className="admin-panel-container">
            <h1>Admin Panel</h1>
            <p>Welcome, {user.firstName}! You have administrative access.</p>
            {/* Add your admin panel functionalities here */}
        </div>
    );
};

export default AdminPanelPage;