// ProfilePage.tsx
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure } from '@chakra-ui/react';
import React, { ChangeEvent, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';



const ProfilePage = () => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()
  


    return (
        <div className="profile-page">
             <h1>Profile Page</h1>
            <nav>
                <Link to="/profile/userinfo">User Information</Link>
                <Link to="/profile/customization">Customization</Link>
                <Link to="/profile/preferences">Preferences</Link>
            </nav>
            <Outlet /> {/* Renders the nested routes */}

        </div>

        


        
    );
};

export default ProfilePage;