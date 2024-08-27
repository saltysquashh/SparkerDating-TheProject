import React, { useState, useEffect, useContext } from "react";
import "../styles/MatchDetailsPage.css";
import { deleteMatch, getMatchById } from "../services/matchService";
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
import { calculateTimeLeft, formatDate } from "../utilities/dateUtils";
import MatchType from "../interfaces/MatchInterface";
import ConfirmDialog from "./globalComponents/alertDialog";

const MatchDetailsPage = () => {
	const navigate = useNavigate();
	const { matchId, matchUserId } = useParams();
	const [match, setMatch] = useState<MatchType | null>(null);
	const [timeLeftUser1, setTimeLeftUser1] = useState<string | null>(null);
	const [timeLeftUser2, setTimeLeftUser2] = useState<string | null>(null);
	const [matchCreatedAt, setMatchCreatedAt] = useState<string | null>(null);
	const [isGhosted, setIsGhosted] = useState(false);
	const { authUser } = useContext(AuthContext);
	const authUserId = authUser?.id;
	const { isOpen, onOpen, onClose } = useDisclosure();
	const cancelRef = React.useRef<HTMLButtonElement>(null);
	const [ghostedByName, setGhostedByName] = useState<string | null>(null);

	const updateGhostingTimers = (matchData: MatchType) => {
		const { timeLeftUser1, timeLeftUser2 } = calculateTimeLeft(
			matchData,
			authUserId,
			matchData.matchUser?.id
		);

		setTimeLeftUser1(formatTimeLeft(timeLeftUser1));
		setTimeLeftUser2(formatTimeLeft(timeLeftUser2));
	};

	const formatTimeLeft = (
		timeLeft: { hours: number; minutes: number; seconds: number } | null
	): string => {
		if (
			!timeLeft ||
			(timeLeft.hours <= 0 &&
				timeLeft.minutes <= 0 &&
				timeLeft.seconds <= 0)
		) {
			return "Any minute..."; // let the user know that the match will be ghosted any minute now (next time the bacgkround check runs)
		}

		const { hours, minutes, seconds } = timeLeft;
		return `${hours}h ${minutes}m ${seconds}s`;
	};

	useEffect(() => {
		const loadData = async () => {
			try {
				const RetrievedMatch = await getMatchById(matchId, authUserId);
				setMatch(RetrievedMatch);
				console.log(RetrievedMatch);
				setMatchCreatedAt(formatDate(RetrievedMatch.matchedAt));
				updateGhostingTimers(RetrievedMatch);
				setIsGhosted(RetrievedMatch.isGhosted);
				setGhostedByName(RetrievedMatch.matchUser.fullName);
			} catch (error) {
				console.error("Error fetching match data:", error);
			}
		};

		const intervalLoadData = setInterval(loadData, 45000);

		loadData(); // Initial load

		return () => clearInterval(intervalLoadData);
	}, [matchId, authUserId]);

	useEffect(() => {
		const intervalTimeLeft = setInterval(() => {
			if (match) {
				updateGhostingTimers(match);
			}
		}, 1000);

		return () => clearInterval(intervalTimeLeft);
	}, [match]);

	if (!match || !match.matchUser) {
		return <div className="match-page-error">Match not found.</div>;
	}

	const handleChatClick = () => {
		navigate(`/matches/match/${matchId}/chat/${matchUserId}`);
	};

	const handleUnmatchClick = async () => {
		try {
			await deleteMatch(matchId, authUserId);
			navigate(`/matches/`);
		} catch (error) {
			console.error("Error handling unmatch action:", error);
		}
	};

	return (
		<div className="global-container">
			<div className="match-details-page-container">
				<div className="match-page-title">
					<h2>Match</h2>
				</div>
				<div className="match-card-container">
					<div className="match-header">
						<div className="match-name-section">
							<h2>{match.matchUser.fullName}</h2>
						</div>
						<div className="match-images-container">
							{match.matchUser.images.length > 0 ? (
								match.matchUser.images.map((image, index) => (
									<div
										key={index}
										className="match-image-thumbnail"
									>
										<img
											src={`data:image/png;base64,${image}`}
											alt="Match"
										/>
									</div>
								))
							) : (
								<div className="match-image-thumbnail">
									<img
										src="/images/default-user-image.png"
										alt="Default"
										className="match-item-image"
									/>
								</div>
							)}
						</div>
						<div className="match-bio-section">
							<div className="match-bio-title">Bio</div>
							<div className="match-bio-content">
								<p>{match.matchUser.bio}</p>
							</div>
						</div>
						<div className="match-details-section">
							<div className="match-details-title">
								<h1>Details</h1>
							</div>
							<div className="match-detail-text">
								Age: {match.matchUser.age}
							</div>
							<div className="match-detail-text">
								Gender: {match.matchUser.gender}
							</div>
						</div>
					</div>

					<div className="match-status-section">
						<div className="match-status-title">
							<h1>Ghosting Status</h1>
						</div>

						{isGhosted ? (
							<div className="ghosted-message">
								The match has been ghosted and locked... It was
								ghosted by {ghostedByName} at{" "}
								{formatDate(match.ghost.ghostedAt)}
							</div>
						) : (
							<>
								<div className="time-left-title">
									Time left before ghosting:
								</div>
								<p>
									{authUserId === match.user1Id
										? "You"
										: match.matchUser.fullName}
									: {timeLeftUser1}
								</p>
								<p>
									{authUserId === match.user2Id
										? "You"
										: match.matchUser.fullName}
									: {timeLeftUser2}
								</p>
							</>
						)}
					</div>
					<div className="match-actions">
						{!isGhosted ? (
							<Button
								onClick={handleChatClick}
								colorScheme="blue"
								className="action-button"
							>
								Chat
							</Button>
						) : (
							<Button
								colorScheme="gray"
								className="action-button"
								disabled
							>
								Locked
							</Button>
						)}
						<Button
							onClick={onOpen}
							colorScheme="red"
							className="action-button"
						>
							Unmatch
						</Button>
					</div>

					<ConfirmDialog
						isOpen={isOpen}
						onClose={onClose}
						onConfirm={handleUnmatchClick}
						cancelRef={cancelRef}
						title="Unmatch"
						body="Are you sure you want to delete this match? You can't undo this action."
					/>
					<div className="matched-at-text">
						You matched with {match.matchUser.fullName} on{" "}
						{matchCreatedAt}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MatchDetailsPage;
