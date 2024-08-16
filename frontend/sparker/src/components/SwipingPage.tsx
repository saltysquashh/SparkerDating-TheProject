import React, { useState, useEffect, useContext } from 'react';
import '../styles/SwipingPage.css';
import { AuthContext } from '../context/AuthContext';
import SwipeUser from '../interfaces/SwipeUserInterface';
import { createSwipe } from '../services/swipeService';
import axios from 'axios';
import { fetchNextUserToSwipe } from '../services/userService';
import { useNavigate } from 'react-router-dom';

const SwipingPage = () => {
    const { user } = useContext(AuthContext);
    const [displayedUser, setDisplayedUser] = useState<SwipeUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [images, setImages] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNextUser();
    }, []);

    const fetchNextUser = async () => {
        setIsLoading(true);
        try {
            const response = await fetchNextUserToSwipe(user?.id);
            setDisplayedUser(response);
            setImages(response.images || []);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setDisplayedUser(null);
            } else {
                console.error("Error fetching next user:", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwipe = async (liked: boolean) => {
        if (!displayedUser || !user) return;
        try {
            const success = await createSwipe(Number(user.id), Number(displayedUser.id), liked);
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
        navigate('/preferencepage');
    };

    return (
        <div className="global-container">
            <div className="swiping-container">
                {isLoading ? (
                    <div className="status-box">
                        <p>Loading...</p>
                    </div>
                ) : !displayedUser ? (
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
                                    <img src={`data:image/png;base64,${image}`} alt="Match" />
                                </div>
                            ))}
                        </div>
                        <h3 className="profile-name">{displayedUser.name}, {displayedUser.age}</h3>
                        <p className="profile-gender">{displayedUser.gender}</p>
                        {displayedUser.bio && <p className="profile-bio">"{displayedUser.bio}"</p>}
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
