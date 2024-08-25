// SwipeHistoryPage.tsx
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure } from '@chakra-ui/react';
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SwipeHistoryType from '../interfaces/SwipeHistoryInterface';
import { fetchSwipesByUser } from '../services/swipeService.js';
import '../styles/Global.css';
import '../styles/SwipeHistoryPage.css';

const SwipeHistoryPage = () => {
    const { authUser } = useContext(AuthContext);
    const [swipes, setSwipes] = useState<SwipeHistoryType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    
    useEffect(() => {
        const loadSwipes = async () => {
            if (authUser) {
                setIsLoading(true);
                try {
                    const fetchedSwipes = await fetchSwipesByUser(authUser.id);
                    setSwipes(fetchedSwipes);
                    // console.log("Fetched Swipes:", fetchedSwipes); // Log the fetched Swipes
                } catch (error) {
                    console.error('Error fetching Swipes:', error);
                }
                setIsLoading(false);
            }
        };
    
        loadSwipes();
    }, [authUser]);

    const handleSwipeClick = (SwipeId: number, SwipeUserId: number) => {
        console.log('Swipe clicked, their userId is: ', SwipeUserId);
        navigate(`/swipehistory/swipedetails/${SwipeId}/${SwipeUserId}`);
    };

    if (isLoading) {
        return <div>Loading Swipes...</div>;
    }

    if (swipes.length === 0) {
        return <div>No Swipes found.</div>;
    }

    return (
        <div className="global-container">
            <div className="swipes-container">
                <div className="swipe-history-page-title">
                <h2>Your Swipes</h2>
                </div>
                <ul className="swipe-list">
                    {swipes.map((swipe) => (
                        <li
                            key={swipe.id}
                            onClick={() => handleSwipeClick(swipe.id, swipe.swipedUserId)}
                            className={`swipe-item ${swipe.liked ? 'swipe-liked' : 'swipe-passed'}`}
                        >
                            <div className="swipeuser-images">
                                <img
                                    src={swipe.swipedImageData ? 
                                        `data:image/png;base64,${swipe.swipedImageData}` : 
                                        '/images/default-user-image.png'}
                                    alt={swipe.swipedName}
                                    className="swipe-image"
                                />
                            </div>
                            <div className="swipeuser-title">
                                {swipe.swipedName} - Swiped on {new Date(swipe.swipedAt).toLocaleDateString()}
                            </div>
                            <div>
                                {swipe.swipedAge}, {swipe.swipedGender}
                            </div>
                            <div>
                                {swipe.liked ? 'You liked ' : 'You passed on '} {swipe.swipedName}
                            </div>
                            <div>
                                Is a match: {swipe.isMatch ? 'Yes' : 'No'}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SwipeHistoryPage;