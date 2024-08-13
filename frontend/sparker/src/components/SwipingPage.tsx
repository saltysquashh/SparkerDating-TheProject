import React, { useState, useEffect, useContext } from 'react';
import '../styles/SwipingPage.css';
import { AuthContext } from '../context/AuthContext';
import SwipeUser from '../interfaces/SwipeUserInterface';
import { sendSwipeAction } from '../services/swipeService';
import axios from 'axios';
import ImageType from '../interfaces/ImageInterface';
import { fetchUserImages } from '../services/imageService';
import { fetchNextUserToSwipe } from '../services/userService';


const SwipingPage = () => {
    const { user } = useContext(AuthContext);
    const [displayedUser, setDisplayedUser] = useState<SwipeUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [images, setImages] = useState<ImageType[]>([]);

    // Fetch the initial user profile when the component mounts
    useEffect(() => {
        fetchNextUser();
    }, []);

    const fetchNextUser = async () => {
        setIsLoading(true);
        try {
            const response = await fetchNextUserToSwipe(user?.id);
            setDisplayedUser(response);
            const userImages = await fetchUserImages(response.id); // TODO aren't the images already included in the fetchnextuser call?
            setImages(userImages);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // Handle the case where no more users are available
                setDisplayedUser(null);
            } else {
                console.error("Error fetching next user:", error);
            }
        } finally {
            // Finally, stop loading regardless of success or error
            setIsLoading(false);
        }
    };

    const handleSwipe = async (liked: boolean) => {
        if (!displayedUser || !user) return; // Check if both user and displayedUser are not null
        try {
            // Convert IDs to numbers before passing them to the function
            const matched = await sendSwipeAction(Number(user.id), Number(displayedUser.id), liked);

            // if (matched == true)
            // {
            //    // gør noget
            // }

            fetchNextUser().catch((error) => {
                console.error("Error fetching next user:", error);
                // Handle the error appropriately
            });
        } catch (error) {
            console.error("Error handling swipe action:", error);
            // Handle the error appropriately
        }
    };
    

    if (isLoading) {
        return <div className="swiping-container">Loading...</div>;
    }
    
    if (!displayedUser) {
        return <div className="swiping-container">No more users to swipe on.</div>;
    }


    return (
        <div className="swiping-container">
            
            <div className="profile-card">
            <div className="match-images-container">
                {images.map((image, index) => (
                    <div key={index} className="match-image-thumbnail">
                        <img src={`data:image/png;base64,${image.image_Data}`} alt="Match" />
                    </div>
                ))}
            </div> 
                <h3 className="profile-name">{displayedUser.name}, {displayedUser.age}</h3>
                <p className="profile-description">{displayedUser.bio}</p>
                <div className="action-buttons">
                    <button className="pass-button" onClick={() => handleSwipe(false)}>Pass</button>
                    <button className="like-button" onClick={() => handleSwipe(true)}>Like</button>
                </div>
            </div>

        </div>
    );
};

export default SwipingPage;
