import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchUserActivitySummary } from "../services/matchService";
import "../styles/ActivitySummaryPage.css";
import ActivitySummaryDTO from "../interfaces/ActivitySummaryInterface";

const ActivitySummaryPage = () => {
	const { authUser } = useContext(AuthContext);
	const [activitySummary, setActivitySummary] =
		useState<ActivitySummaryDTO | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			if (authUser && authUser.id) {
				try {
					const summary = await fetchUserActivitySummary(authUser.id);
					setActivitySummary(summary);
				} catch (error) {
					console.error("Error fetching welcome data:", error);
				} finally {
					setIsLoading(false);
				}
			}
		};

		fetchData();
	}, [authUser]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!activitySummary) {
		return <div>Error loading activity summary.</div>;
	}

	const { newMatches, expiredMatches } = activitySummary;

	return (
		<div className="global-container">
			<div className="welcome-page-container">
				<h1>Welcome back, {authUser?.firstName}!</h1>
				<div className="welcome-section">
					<h2>New Matches</h2>
					{newMatches.length > 0 ? (
						<p>You have {newMatches.length} new match(es)!</p>
					) : (
						<p>No new matches since you last logged in.</p>
					)}
				</div>
				<div className="welcome-section">
					<h2>Ghosted Matches</h2>
					{expiredMatches.length > 0 ? (
						<p>
							While you were gone, {expiredMatches.length} of your
							matches were ghosted.
						</p>
					) : (
						<p>
							No matches expired while you were gone, but make
							sure to check up on them before it's too late!
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default ActivitySummaryPage;
