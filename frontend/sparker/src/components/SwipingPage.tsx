import React, { useState, useEffect, useContext } from 'react';
import '../styles/SwipingPage.css';
import { AuthContext } from '../context/AuthContext';
import SwipeUser from '../interfaces/SwipeUserInterface';
import { createSwipe } from '../services/swipeService';
import axios from 'axios';
import { fetch_nextUserToSwipe } from '../services/userService';
import { useNavigate } from 'react-router-dom';

const SwipingPage = () => {
    const { authUser } = useContext(AuthContext);
    const [swipeUser, setSwipeUser] = useState<SwipeUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [images, setImages] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNextUser();
    }, []);

    const fetchNextUser = async () => {
        setIsLoading(true);
        try {
            const response = await fetch_nextUserToSwipe(authUser?.id);
            console.log(response);
            setSwipeUser(response);
            const userImages = response.images || [];

            if (userImages.length > 0) {
                // snsure base64 strings are correctly prefixed
                const formattedImages = userImages.map((img: string) =>
                    img.startsWith('data:image/') ? img : `data:image/png;base64,${img}`
                );
                setImages(formattedImages);
            } else {
                // use a default user image if the user has no images
                setImages(['/images/default-user-image.png']);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setSwipeUser(null);
            } else {
                console.error("Error fetching next user:", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwipe = async (liked: boolean) => {
        if (!swipeUser || !authUser) return;
        try {
            const success = await createSwipe(Number(authUser.id), Number(swipeUser.id), liked);
            if (success) {
                fetchNextUser().catch((error) => {
                    console.error("Error fetching next user:", error);
                });
            }
        } catch (error) {
            console.error("Error handling swipe action:", error);
        }
    };

    const handlePreferencesClick = () => {
        navigate('/profile/preferences');
    };

    return (
        <div className="global-container">
            <div className="swiping-container">
                {isLoading ? (
                    <div className="status-box">
                        <p>Loading...</p>
                    </div>
                ) : !swipeUser ? (
                    <div className="status-box">
                        <p>No more users to swipe on.</p>
                        <button className="preferences-button" onClick={handlePreferencesClick}>
                            Change your preferences
                        </button>
                    </div>
                ) : (
                    <div className="profile-card">
                        <div className="swipe-images-container">
                            {images.map((image, index) => (
                                <div key={index} className="swipe-image-thumbnail">
                                    <img src={image} alt="Swipe User" />
                                </div>
                            ))}
                        </div>
                        <h3 className="profile-name">{swipeUser.fullName}, {swipeUser.age}</h3>
                        <p className="profile-gender">{swipeUser.gender}</p>
                        {swipeUser.bio && <p className="profile-bio">"{swipeUser.bio}"</p>}
                        <div className="action-buttons">
                            <button className="pass-button" onClick={() => handleSwipe(false)}>Pass</button>
                            <button className="like-button" onClick={() => handleSwipe(true)}>Like</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SwipingPage;
