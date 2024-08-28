import React, { useState, ChangeEvent, FormEvent, useContext } from "react";
import "../styles/LoginPage.css";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/ProfilePage.css";
import { useToastNotification } from "./providers/toastProvider";
import { useErrorHandling } from "../hooks/useErrorHandling";

const LoginPage = () => {
	const { handleError, clearError } = useErrorHandling();
	const showToast = useToastNotification();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const { login } = useContext(AuthContext);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			// login call
			await login({ email: formData.email, password: formData.password });
			// maybe navigate the user to a different page or update the state here??
		} catch (error) {
			if (axios.isAxiosError(error)) {
				// Handle Axios error
				if (error.response) {
					alert("Login failed: " + error.response.data);
				} else {
					alert("Request made but no response received");
				}
			} else if (error instanceof Error) {
				// Handle generic error
				alert("Error: " + error.message);
			} else {
				// Handle unknown errors
				alert("An unknown error occurred");
			}

			// } catch (error) {
			// 	const errorMessage = handleError(error);
			// 	showToast({
			// 		title: "Error",
			// 		description:
			// 		`${errorMessage}`,
			// 		status: "error",
			// 	});
			// }
		}
	};

	return (
		<div className="global-container">
			<div className="form-container">
				<div className="login-container">
					<div className="login-page-title">
						<h1>Login</h1>
					</div>
					<p>E-mail</p>
					<form onSubmit={handleLogin}>
						<input
							type="email"
							name="email"
							placeholder="Email"
							onChange={handleChange}
							value={formData.email}
							required
						/>
						<p>Password</p>
						<input
							type="password"
							name="password"
							placeholder="Password"
							onChange={handleChange}
							value={formData.password}
							required
						/>
						<button type="submit">Login</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
