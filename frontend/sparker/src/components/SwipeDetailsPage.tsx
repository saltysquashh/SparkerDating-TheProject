import React, { useState, useEffect, useContext } from "react";
import "../styles/SwipeDetailsPage.css";
import { deleteSwipe, fetchSwipeDetails } from "../services/swipeService";
import UserType from "../interfaces/UserInterface";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
	useDisclosure,
} from "@chakra-ui/react";
import { AuthContext } from "../context/AuthContext";
import SwipeHistoryType from "../interfaces/SwipeHistoryInterface";
import SwipeType from "../interfaces/SwipeInterface";
import { useToastNotification } from "./globalComponents/toastProvider";
import { useErrorHandling } from "../hooks/useErrorHandling";

const SwipeDetailsPage = () => {
	const { swipeId } = useParams();
	const { swipeUserId } = useParams();
	const [swipeUserInfo, setUserInfo] = useState<UserType | null>(null);
	const [swipe, setSwipe] = useState<SwipeType | null>(null);
	const [images, setImages] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isMatched, setIsMatched] = useState(false); // Track if a match exists
	const navigate = useNavigate();
	const { authUser } = useContext(AuthContext);

	const { isOpen, onOpen, onClose } = useDisclosure();
	const cancelRef = React.useRef<HTMLButtonElement>(null);

	const { handleError, clearError } = useErrorHandling();
	const showToast = useToastNotification();
	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			try {
				const swipeDetails = await fetchSwipeDetails(
					swipeUserId,
					authUser?.id
				);
				console.log("Fetched Swipe:", swipeDetails); // Log the fetched Swipes
				setUserInfo(swipeDetails.swipeUser);
				setImages(swipeDetails.swipeUser.images || []);
				setSwipe(swipeDetails.swipe);

				// Check if a match exists between the user and swipeUser
				const matchExists = !!swipeDetails.match;

				setIsMatched(matchExists); // Set if a match exists
			} catch (error) {
				const errorMessage = handleError(error);
				showToast({
					title: "Error",
					description: `${errorMessage}`,
					status: "error",
				});
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
			// alert(responseMsg);
		} catch (error) {
			const errorMessage = handleError(error);
			showToast({
				title: "Error",
				description: `${errorMessage}`,
				status: "error",
			});
		}
		navigate(`/swipehistory/`);
	};

	const handleGoToMatchClick = () => {
		navigate(`/matches/match/${swipeId}/${swipeUserId}`);
	};

	return (
		<div className="global-container">
			<div className="swipe-details-page-container">
				<div className="swipe-page-title">
					<h2>Swipe</h2>
				</div>
				<div className="swipe-card-container">
					<div className="swipe-header">
						<div className="swipe-name-section">
							<h2>
								{swipeUserInfo.firstName}{" "}
								{swipeUserInfo.lastName}
							</h2>
						</div>
						<div className="swipe-images-container">
							{images.length > 0 ? (
								images.map((image, index) => (
									<div
										key={index}
										className="swipe-image-thumbnail"
									>
										<img
											src={`data:image/png;base64,${image}`}
											alt="Swipe"
										/>
									</div>
								))
							) : (
								<div className="swipe-image-thumbnail">
									<img
										src="/images/default-user-image.png"
										alt="Default"
										className="swipe-item-image"
									/>
								</div>
							)}
						</div>
						<div className="swipe-bio-section">
							<div className="swipe-bio-title">Bio </div>
							<div className="swipe-bio-content">
								<p>{swipeUserInfo.bio}</p>
							</div>
						</div>
						<div className="swipe-details-section">
							<div className="swipe-details-title">
								<h1>Details</h1>
							</div>
							<div className="swipe-detail-text">
								Age: {swipeUserInfo?.age}
							</div>
							<div className="swipe-detail-text">
								Gender: {swipeUserInfo?.gender}
							</div>
						</div>
					</div>

					<div className="swipe-status-section">
						<div className="swipe-status-title">
							<h1>Status</h1>
						</div>
						<div className="swipe-status-text">You swiped at:</div>
						<div>{swipe?.swiped_At}</div>
						{!isMatched ? (
							<h1>
								You have not matched with{" "}
								{swipeUserInfo.firstName} yet
							</h1>
						) : (
							<p>You matched with {swipeUserInfo.firstName}</p>
						)}
					</div>
					<div className="swipe-actions">
						{!isMatched ? (
							<Button
								onClick={onOpen}
								colorScheme="red"
								className="action-button"
							>
								Undo swipe
							</Button>
						) : (
							<Button
								onClick={handleGoToMatchClick}
								colorScheme="blue"
								className="action-button"
							>
								Go to Match
							</Button>
						)}
					</div>
				</div>
			</div>

			<AlertDialog
				isOpen={isOpen}
				leastDestructiveRef={cancelRef}
				onClose={onClose}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Unswipe
						</AlertDialogHeader>
						<AlertDialogBody>
							Are you sure you want to delete this swipe? You
							can't undo this action afterwards.
						</AlertDialogBody>
						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={onClose}>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								onClick={() => {
									handleUnswipeClick();
									onClose(); // This will close the dialog after the action
								}}
								ml={3}
							>
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
