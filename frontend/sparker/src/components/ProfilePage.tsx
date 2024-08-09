// ProfilePage.tsx
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure } from '@chakra-ui/react';
import React, { ChangeEvent, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import '../styles/ProfilePage.css';
import '../styles/Global.css';


const ProfilePage = () => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()
  


    return (
        <div className="global-container">

            <div className='page-title'>
             <h1>Profile Page</h1>
             </div>
            <nav>
                <div>
                <Link to="/profile/userinfo">User Information</Link>
                </div>
                <div>
                <Link to="/profile/customization">Customization</Link>
                </div>
                <div>
                <Link to="/profile/preferences">Preferences</Link>
                </div>
            </nav>
            <Outlet /> {/* Renders the nested routes */}

  </div>
        


        
    );
};

export default ProfilePage;