import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/AdminPanelPage.css';
import UserType from '../interfaces/UserInterface';
import { deleteUser, fetchUsers } from '../services/userService';
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

        if (!user?.isAdmin) {
            alert('Unauthorized.');
            navigate('/');
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
                    <li key={shownUser.id} onClick={() => handleUserClick(shownUser.id)} className="user-item">
                        {/* {shownUser.imageData && <img src={`data:image/png;base64,${shownUser.imageData}`} alt={`${shownUser.matchedName}`} className="match-image" />} */}
                        <div>
                        Id: {shownUser.id}
                        </div>
                        <div>
                        First name: {shownUser.firstName}
                        </div>
                        <div>
                        Last name: {shownUser.lastName}
                        </div>
                        <div>
                        Registration date: (Reg. date coming here)
                        </div>
                        <div>
                        Type: {shownUser.isAdmin ? 'Admin' : 'User'} {shownUser.isMaster ? '(Master)' : ''}
                        </div>
                        <div className="admin-panel-buttons">
                            <Button onClick={() => handleUserDelete(shownUser.id, user.id)} colorScheme='green'>Promote</Button>
                            <Button onClick={() => handleUserDelete(shownUser.id, user.id)} colorScheme='yellow'>Demote</Button>
                            <Button onClick={() => handleUserDelete(shownUser.id, user.id)} colorScheme='red'>Delete</Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        </div>
    );
};

export default AdminPanelPage;