import React from "react";
import "../styles/HomePage.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const HomePage = () => {
	let navigate = useNavigate();
	const handleLoginClick = () => {
		navigate("/login");
	};

	const handleRegisterClick = () => {
		navigate("/register");
	};

	return (
		<div className="global-container">
			<div className="homepage-container">
				<div className="homepage-title">
					<h1>Welcome to Sparker</h1>
				</div>
			</div>
		</div>
	);
};

export default HomePage;
