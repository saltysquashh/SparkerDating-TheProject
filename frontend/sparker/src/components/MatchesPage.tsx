import React, { useState, useEffect, useContext } from "react";
import "../styles/MatchesPage.css";
import { AuthContext } from "../context/AuthContext";
import { fetch_allMatchesByUserId } from "../services/matchService";
import { useNavigate } from "react-router-dom";
import MatchType from "../interfaces/MatchInterface";

const MatchesPage = () => {
	const { authUser } = useContext(AuthContext);
	const [matches, setMatches] = useState<MatchType[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const loadMatches = async () => {
			if (authUser) {
				setIsLoading(true);
				try {
					const matches = await fetch_allMatchesByUserId(authUser.id);
					setMatches(matches);
				} catch (error) {
					console.error("Error fetching matches:", error);
				}
				setIsLoading(false);
			}
		};

		loadMatches();
	}, [authUser]);

	const handleListedMatchClick = (matchId: number, matchUserId: number) => {
		navigate(`/matches/match/${matchId}/${matchUserId}`);
	};

	const handleGoToSwipingPageClick = () => {
		navigate("/swiping");
	};

	if (isLoading) {
		return (
			<div className="loading-message-container">Loading matches...</div>
		);
	}

	// if (matches.length === 0) {
	//     return <div className="no-matches-message-container">No matches found.</div>;
	// }

	return (
		<div className="global-container">
			<div className="matches-page-container">
				<div className="matches-list-container">
					<div className="matches-page-title">
						<h1>Your Matches</h1>
					</div>
					<ul className="matches-list">
						{matches.length <= 0 && (
							<div>
								<p className="empty-list">
									You have no matches.
								</p>
								<button
									className="navigate-swiping-button"
									onClick={handleGoToSwipingPageClick}
								>
									Go Swiping
								</button>
							</div>
						)}
						{matches.map((match) => (
							<li
								key={`${match.id}-${match.matchUser?.id}`}
								onClick={() =>
									handleListedMatchClick(
										match.id,
										match.matchUser?.id
									)
								}
								className="match-list-item"
							>
								<div className="match-item-details">
									<div className="match-item-image-container">
										{match.matchUser?.images?.length > 0 ? (
											<img
												src={`data:image/png;base64,${match.matchUser.images[0]}`}
												alt={match.matchUser.fullName}
												className="match-item-image"
											/>
										) : (
											<img
												src="/images/default-user-image.png"
												alt="Default"
												className="match-item-image"
											/>
										)}
									</div>
									<div className="match-item-info">
										<h2 className="match-item-name">
											{match.matchUser?.fullName ||
												"Unknown User"}
										</h2>
										<p className="match-item-date">
											Matched on{" "}
											{new Date(
												match.matchedAt
											).toLocaleDateString()}
										</p>
									</div>
								</div>
								{match.isGhosted && (
									<img
										src="/images/ghosted-icon-transparent.png"
										alt="Ghosted"
										className="ghost-icon"
									/>
								)}
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default MatchesPage;
