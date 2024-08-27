import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css";
import { AuthContext } from "../context/AuthContext";
import Dropdown from "./Dropdown";

const Header = () => {
	const { authUser, logout } = useContext(AuthContext);

	const navigate = useNavigate();

	const loginOptions = [
		{ label: "Log in", action: () => navigate("/login") },
		{ label: "Register", action: () => navigate("/register") },
	];

	const userOptions = [
		{ label: "Swiping", action: () => navigate("/swiping") },
		{ label: "Matches", action: () => navigate("/matches") },
		{ label: "Swipe history", action: () => navigate("/swipehistory") },
		{ label: "Profile", action: () => navigate("/profile") },
		...(authUser?.isAdmin
			? [{ label: "Admin panel", action: () => navigate("/adminpanel") }]
			: []),
		{ label: "Log out", action: logout },
	];

	return (
		<header className="header">
			<Link to="/" className="logo-link">
				<div className="sparker-title">
					<h1>Sparker </h1>
				</div>
				<img
					src="/images/sparker-logo-transparent.png"
					alt="Logo"
					className="header-logo"
				/>
			</Link>
			<div className="header-right">
				<Dropdown options={authUser ? userOptions : loginOptions} />
				{authUser && (
					<div className="logged-in-info">
						Logged in as{" "}
						<strong>
							{authUser.firstName} {authUser.lastName}
						</strong>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;
