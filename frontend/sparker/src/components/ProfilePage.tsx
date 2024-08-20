// ProfilePage.tsx
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure } from '@chakra-ui/react';
import React, { ChangeEvent, useState, useContext, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import '../styles/ProfilePage.css';
import '../styles/Global.css';
import UserType from '../interfaces/UserInterface';
import { AuthContext } from '../context/AuthContext';

const ProfilePage = () => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()
    const { user } = useContext(AuthContext);


    return (
        <div className="global-container">
        <div className="profile-menu-container">
            <div className='profile-page-title'>
             <h1>Profile Page - {user?.firstName}</h1>
             </div>
             <div className="profile-links">
            <nav>
                <div className="link-to-userinfo">
                <Link to="/profile/userinfo">User information</Link>
                </div>
                <div className="link-to-customization">
                <Link to="/profile/customization">Customization</Link>
                </div>
                <div className="link-to-preferences">
                <Link to="/profile/preferences">Preferences</Link>
                </div>
            </nav>
            </div>
            <Outlet /> {/* Renders the nested routes */}
            </div>
  </div>
        


        
    );
};

export default ProfilePage;