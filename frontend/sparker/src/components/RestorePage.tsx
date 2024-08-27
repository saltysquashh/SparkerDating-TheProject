import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
	fetch_allMatchesByUserId,
	restoreMatch,
} from "../services/matchService";
import MatchType from "../interfaces/MatchInterface";
import { Button } from "@chakra-ui/react";
import "../styles/MatchesPage.css";
import "../styles/RestorePage.css";
import { useToastNotification } from "./globalComponents/toastProvider";
import { useErrorHandling } from "../hooks/useErrorHandling";

const RestorePage = () => {
	const { authUser } = useContext(AuthContext);
	const { userId } = useParams<{ userId: string }>();
	const [matches, setMatches] = useState<MatchType[]>([]);

	const [isLoading, setIsLoading] = useState(true);
	const showToast = useToastNotification();

	const { handleError, clearError } = useErrorHandling();

	useEffect(() => {
		const loadMatches = async () => {
			if (authUser) {
				setIsLoading(true);
				try {
					const matches = await fetch_allMatchesByUserId(
						Number(userId)
					);
					setMatches(matches);
				} catch (error) {
					const errorMessage = handleError(error);
					showToast({
						title: "Error",
						description: `${errorMessage}`,
						status: "error",
					});
				}
				setIsLoading(false);
			}
		};

		loadMatches();
	}, [authUser, userId]);

	const handleIsAliveClick = async () => {
		alert("The match is still active.");
	};

	const handleRestoreMatch = async (matchId: number, adminUserId: number) => {
		try {
			await restoreMatch(matchId, adminUserId);

			// alert("Match restored successfully."); // use toast instead
			showToast({
				title: "Match restored",
				description:
					"The match was restored, and are no longer ghosted.",
				status: "success",
			});

			setMatches((prevMatches) =>
				prevMatches.map((m) =>
					m.id === matchId ? { ...m, isGhosted: false } : m
				)
			);
		} catch (error) {
			const errorMessage = handleError(error);
			showToast({
				title: "Error",
				description: `${errorMessage}`,
				status: "error",
			});
		}
	};

	if (isLoading) {
		return (
			<div className="loading-message-container">Loading matches...</div>
		);
	}

	if (matches.length === 0) {
		return (
			<div className="no-matches-message-container">
				No matches found.
			</div>
		);
	}

	return (
		<div className="global-container">
			<div className="matches-page-container">
				<div className="matches-list-container">
					<div className="matches-page-title">
						<h1>Matches of User {userId}</h1>
					</div>
					<ul className="matches-list">
						{matches.map((match) => (
							<li
								key={`${match.id}-${match.matchUser?.id}`}
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

								{!match.isGhosted ? (
									<div>
										<div>
											<Button
												onClick={() =>
													handleIsAliveClick()
												}
												colorScheme="green"
											>
												Alive
											</Button>
										</div>
										<img
											src="/images/sparker-logo-transparent.png"
											alt="Sparker"
											className="restore-ghost-icon"
										/>
									</div>
								) : (
									<div>
										<div>
											<Button
												onClick={() => {
													if (authUser?.id) {
														handleRestoreMatch(
															match.id,
															authUser.id
														);
														console.log(
															"Userid of caller: " +
																authUser.id
														);
													} else {
														console.error(
															"User ID is undefined"
														);
													}
												}}
												colorScheme="blue"
												disabled={!match.isGhosted}
											>
												Restore Match
											</Button>
										</div>
										<div>
											<img
												src="/images/ghosted-icon-transparent.png"
												alt="Ghosted"
												className="restore-ghost-icon"
											/>
										</div>
									</div>
								)}
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default RestorePage;
