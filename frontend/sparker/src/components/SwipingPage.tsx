import React, { useState, useEffect, useContext } from "react";
import "../styles/SwipingPage.css";
import { AuthContext } from "../context/AuthContext";
import SwipeUser from "../interfaces/SwipeUserInterface";
import { createSwipe } from "../services/swipeService";
import axios from "axios";
import { fetch_nextUserToSwipe } from "../services/userService";
import { useNavigate } from "react-router-dom";
import { useToastNotification } from "./providers/toastProvider";
import { useErrorHandling } from "../hooks/useErrorHandling";

const SwipingPage = () => {
	const { authUser } = useContext(AuthContext);
	const [swipeUser, setSwipeUser] = useState<SwipeUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [images, setImages] = useState<string[]>([]);
	const navigate = useNavigate();
	const { handleError, clearError } = useErrorHandling();
	const showToast = useToastNotification();
	const [swipeReady, setSwipeReady] = useState(false);

	useEffect(() => {
		getSwipeUser();
	}, []);

	const getSwipeUser = async () => {
		setIsLoading(true);
		setSwipeReady(false);
		try {
			const response = await fetch_nextUserToSwipe(authUser?.id);
	
			if (response === false) {
				setSwipeUser(null);
				setImages([]);
				return;
			}
	
			setSwipeUser(response);

			// set images
			const userImages = response.images || [];
			if (userImages.length > 0) {
				// Ensure base64 strings are correctly prefixed
				const formattedImages = userImages.map((img: string) =>
					img.startsWith("data:image/")
						? img
						: `data:image/png;base64,${img}`
				);
				setImages(formattedImages);
			} else {
				// Use a default user image if the user has no images
				setImages(["/images/default-user-image.png"]);
			}
			
			setSwipeReady(true);
		} catch (error) {
			console.error("Error fetching next user:", error);
		} finally {
			setIsLoading(false);
		}
	};
	

	const handleSwipe = async (liked: boolean) => {	
		if (!swipeUser || !authUser) return;
		
		setSwipeReady(false);
		// setSwipeUser(null);  // Immediately clear the displayed user to avoid persistence
	
		try {
			const newSwipe = await createSwipe(Number(authUser.id), Number(swipeUser.id), liked);
			if (newSwipe.isMatch) {
				toastSwipeIsMatch();
			}
			// get the next user
			await getSwipeUser();  // Fetch the next user after clearing the current one
		} catch (error) {
			const errorMessage = handleError(error);
			showToast({
				title: "Error",
				description: `${errorMessage}`,
				status: "error",
			});
		}
	};
	
	const toastSwipeIsMatch = () => {
		showToast({
			title: "New match",
			description:
				`You matched with ${swipeUser?.fullName}`,
			status: "success",
		});
	}

	const handlePreferencesClick = () => {
		navigate("/profile/preferences");
	};


	return (
		<div className="global-container">
			<div className="swiping-container">
				{isLoading ? (
					<div className="status-box">
						<p>Loading...</p>
					</div>
				) : (!swipeUser) ? (
					<div className="status-box">
						<p>
							No more users to swipe on, that fits you and your
							preferences.
						</p>
						<button
							className="preferences-button"
							onClick={handlePreferencesClick}
						>
							Change your preferences
						</button>
					</div>
				) : (
					<div className="profile-card">
						<div className="swipe-images-container">
							{images.map((image, index) => (
								<div
									key={index}
									className="swipe-image-thumbnail"
								>
									<img src={image} alt="Swipe User" />
								</div>
							))}
						</div>
						<h3 className="profile-name">
							{swipeUser.fullName}, {swipeUser.age}
						</h3>
						<p className="profile-gender">{swipeUser.gender}</p>
						{swipeUser.bio && (
							<p className="profile-bio">"{swipeUser.bio}"</p>
						)}
						{swipeReady && ( // Conditionally render the swipe buttons
							<div className="action-buttons">
								<button
									className="pass-button"
									onClick={() => handleSwipe(false)}
								>
									Pass
								</button>
								<button
									className="like-button"
									onClick={() => handleSwipe(true)}
								>
									Like
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default SwipingPage;
