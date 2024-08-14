import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/AdminPanelPage.css';
import UserType from '../interfaces/UserInterface';
import { deleteUser, demoteAdminToUser, fetchUsers, promoteUserToAdmin } from '../services/userService';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, ButtonGroup, Checkbox, Stack, useDisclosure } from '@chakra-ui/react'


const AdminPanelPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserType[]>([]);

    useEffect(() => {

        if (!user) {
            // Redirect to login page or any other page
            alert('You are not logged in.');
            navigate('/login');
        }

        const loadUsers = async () => {
            if (user) {
                try {
                    const fetchedUsers = await fetchUsers();
                    setUsers(fetchedUsers);
                    console.log("Fetched Matches:", fetchedUsers); // Log the fetched matches
                } catch (error) {
                    console.error('Error fetching matches: ', error);
                }
            }
        };
        loadUsers();
    }, [user, navigate]);

    const handleUserClick = (userId: number) => {
        // console.log('Match clicked, their userId is: ', matchUserId);
        // navigate(`/matches/match/${matchId}/${matchUserId}`);
    };

    const handleUserDelete = async (delUserId: number, byUserId: number) => {
        try {
            const response = await deleteUser(delUserId, byUserId);
            // navigate(`/adminpanel`); // ikke her, men først når knappet er lavet inde på user details
            alert(response)
            setUsers((prevUsers) => prevUsers.filter((u) => u.id !== delUserId)); // prevUsers is the previous state of the 'users' array
        } catch (error) {
            // console.error("Error handling Delete User action: ", error);
        }
    };

    const handleUserPromote = async (userId: number, byUserId: number) => {
        try {
            const response = await promoteUserToAdmin(userId, byUserId);
            alert(response);
            setUsers((prevUsers) => prevUsers.map((u) => 
                u.id === userId ? { ...u, isAdmin: true } : u
            ));
        } catch (error) {
            console.error("Error promoting user: ", error);
        }
    };

    const handleUserDemote = async (adminUserId: number, byUserId: number) => {
        try {
            const response = await demoteAdminToUser(adminUserId, byUserId);
            alert(response);
            setUsers((prevUsers) => prevUsers.map((u) => 
                u.id === adminUserId ? { ...u, isAdmin: false, isMaster: false } : u
            ));
        } catch (error) {
            console.error("Error demoting admin: ", error);
        }
    };

    if (!user?.isAdmin) {
        return <div className="unauthorized-container">You are not authorized as an admin.</div>;
    }

    if (!user) {
        return <div>Loading...</div>; // Show loading or redirect until user is validated
    }


    return (
        <div className="global-container">
            <div className="admin-panel-container">
                <div className='admin-panel-title'>
                    <h1>Admin Panel</h1>
                </div>
                <p>Welcome, {user.firstName}! You have administrative access.</p>
                <h2>All Users</h2>
                <ul className="user-list">
                    {users.map((shownUser) => (
                        <li key={shownUser.id} className="user-item">
                            <div>Id: {shownUser.id}</div>
                            <div>First name: {shownUser.firstName}</div>
                            <div>Last name: {shownUser.lastName}</div>
                            <div>Registration date: {shownUser.registrationAt}</div>
                            <div>Type: {shownUser.isAdmin ? 'Admin' : 'User'} {shownUser.isMaster ? '(Master)' : ''}</div>
                            {!shownUser.isMaster && (
                                <div className="admin-panel-buttons">
                                    {!shownUser.isAdmin && (
                                        <Button onClick={() => handleUserPromote(shownUser.id, user.id)} colorScheme='green'>Promote to Admin</Button>
                                    )}
                                    {shownUser.isAdmin && (
                                        <Button onClick={() => handleUserDemote(shownUser.id, user.id)} colorScheme='yellow'>Demote to User</Button>
                                    )}
                                    {!shownUser.isAdmin && (
                                        <Button onClick={() => handleUserDelete(shownUser.id, user.id)} colorScheme='red'>Delete</Button>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminPanelPage;