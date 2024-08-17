import React, { useState, useEffect, useContext } from 'react';
import '../styles/SwipeDetailsPage.css';
import { fetch_ShowcaseUser } from '../services/userService';
import { deleteSwipe } from '../services/swipeService';
import UserType from '../interfaces/UserInterface';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';

const SwipeDetailsPage = () => {
    const { swipeId } = useParams();
    const { swipeUserId } = useParams();
    const [swipeUserInfo, setUserInfo] = useState<UserType | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch_ShowcaseUser(swipeUserId);
                setUserInfo(response);
                setImages(response.images || []);
            } catch (error) {
                console.error('Error fetching swipe data:', error);
            }
            setIsLoading(false);
        };

        loadData();
    }, [swipeUserId]);

    if (isLoading) {
        return <div className="swipe-page-loading">Loading...</div>;
    }

    if (!swipeUserInfo) {
        return <div className="swipe-page-error">Swipe not found.</div>;
    }

    const handleUnswipeClick = async () => {
        try {
            const responseMsg = await deleteSwipe(swipeId);
            alert(responseMsg);
        } catch (error) {
            console.error("Error handling unswipe action:", error);
        }
        navigate(`/swipehistory/`);
    };

    return (
        <div className="swipe-card-container">
            <div className="swipe-header">
                <h2>{swipeUserInfo.firstName} {swipeUserInfo.lastName}</h2>
                <p className="swipe-bio">{swipeUserInfo.bio}</p>
            </div>
            <div className="swipe-images-container">
                {images.length > 0 ? (
                    images.map((image, index) => (
                        <div key={index} className="swipe-image-thumbnail">
                            <img src={`data:image/png;base64,${image}`} alt="Swipe" />
                        </div>
                    ))
                ) : (
                    <div className="swipe-image-thumbnail">
                        <img src="/images/default-user-image.png" alt="Default" className="swipe-item-image" />
                    </div>
                )}
            </div>
            <div className="swipe-actions">
                <Button onClick={onOpen} colorScheme='red' className="action-button">Undo swipe</Button>
            </div>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Unswipe
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to delete this swipe? You can't undo this action afterwards.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={() => {
                                handleUnswipeClick();
                                onClose(); // This will close the dialog after the action
                            }} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </div>
    );
};

export default SwipeDetailsPage;
