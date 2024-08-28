import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";

import ProfilePage from "./components/ProfilePage";
import UserInfoPage from "./components/UserInfoPage";
import PreferencePage from "./components/PreferencePage";
import { setAuthToken, getAuthToken } from "./utilities/authToken";
import SwipingPage from "./components/SwipingPage";
import CustomizationPage from "./components/CustomizationPage";
import MatchesPage from "./components/MatchesPage";
import MatchDetailsPage from "./components/MatchDetailsPage";
import { ChakraProvider } from "@chakra-ui/react";
import MatchChatPage from "./components/MatchChatPage";
import SwipeHistoryPage from "./components/SwipeHistoryPage";
import SwipeDetailsPage from "./components/SwipeDetailsPage";
import AdminPanelPage from "./components/AdminPanelPage";
import RestorePage from "./components/RestorePage";
import WelcomePage from "./components/ActivitySummaryPage";
import { ToastProvider } from "./components/providers/toastProvider";
import { AuthProvider } from "./components/providers/authProvider";

function App() {
	const token = getAuthToken();
	if (token) {
		setAuthToken(token); //make sure that the the token is set in Axios headers
	}

	return (
		<ChakraProvider>
			<AuthProvider>
				<ToastProvider>
					<Header />
					<Routes>
						<Route path="/" element={<HomePage />} />{" "}
						<Route path="/register" element={<RegisterPage />} />{" "}
						<Route path="/login" element={<LoginPage />} />{" "}
						<Route path="/profile" element={<ProfilePage />}>
							<Route path="userinfo" element={<UserInfoPage />} />
							<Route
								path="preferences"
								element={<PreferencePage />}
							/>
							<Route
								path="customization"
								element={<CustomizationPage />}
							/>
						</Route>
						<Route path="/swiping" element={<SwipingPage />} />{" "}
						<Route path="/matches" element={<MatchesPage />} />{" "}
						<Route
							path="/matches/match/:matchId/:matchUserId"
							element={<MatchDetailsPage />}
						/>{" "}
						<Route
							path="/matches/match/:matchId/chat/:matchUserId"
							element={<MatchChatPage />}
						/>{" "}
						<Route
							path="/swipehistory"
							element={<SwipeHistoryPage />}
						/>{" "}
						<Route
							path="/swipehistory/swipedetails/:swipeId/:swipeUserId"
							element={<SwipeDetailsPage />}
						/>{" "}
						<Route
							path="/adminpanel"
							element={<AdminPanelPage />}
						/>{" "}
						<Route
							path="/adminpanel/restore/:userId"
							element={<RestorePage />}
						/>
						<Route path="/welcome" element={<WelcomePage />} />
					</Routes>
				</ToastProvider>
			</AuthProvider>
		</ChakraProvider>
	);
}

export default App;
