import React, { useState, ChangeEvent, FormEvent } from "react";
import "../styles/RegisterPage.css";
import {
	fetch_checkEmailExists,
	post_registerUser,
} from "../services/userService";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import { useToastNotification } from "./providers/toastProvider";
import { useErrorHandling } from "../hooks/useErrorHandling";

const RegisterPage = () => {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);

	// const { handleError, clearError } = useErrorHandling(); // error message already exists
	const showToast = useToastNotification();

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
		gender: "",
		birthDate: "",
	});
	const [errorMessage, setErrorMessage] = useState("");
	const [validationErrors, setValidationErrors] = useState({
		gender: "",
		birthDate: "",
		email: "",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const isValidEmail = async (
		email: string
	): Promise<{ valid: boolean; message: string }> => {
		if (
			email.includes("@") &&
			email.includes(".") &&
			email.indexOf("@") < email.lastIndexOf(".") &&
			email.lastIndexOf(".") < email.length - 1
		) {
			try {
				const emailExists = await fetch_checkEmailExists(email);
				if (emailExists) {
					return { valid: false, message: "Email already exists." };
				}
				return { valid: true, message: "" };
			} catch (error) {
				return { valid: false, message: "Failed to check email." };
			}
		}
		return { valid: false, message: "Please enter a valid email address." };
	};

	const isValidBirthdate = (birthdate: string): boolean => {
		const birthDate = new Date(birthdate);
		const today = new Date();

		// calculate the age difference in years
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDifference = today.getMonth() - birthDate.getMonth();

		// if the birthdate has not occurred this year yet,then subtract 1 year from the age
		if (
			monthDifference < 0 ||
			(monthDifference === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}

		return age >= 18;
	};

	// Go to step 2 (where the passwords are to be confirmed)
	const handleGoNextStep = async () => {
		let errors = { gender: "", birthDate: "", email: "" };

		if (!formData.gender) {
			errors.gender = "Gender is required.";
		}
		if (!isValidBirthdate(formData.birthDate)) {
			errors.birthDate = "You must be at least 18 years old.";
		}

		const emailValidation = await isValidEmail(formData.email);
		if (!emailValidation.valid) {
			errors.email = emailValidation.message;
		}

		setValidationErrors(errors);

		console.log("Errors: " + errors.email); // Log the errors object directly

		if (!errors.gender && !errors.birthDate && !errors.email) {
			setStep(2);
		}
	};

	const handleGoPreviousStep = () => {
		setStep(1);
	};

	const isValidPassword = (passwordInput: string) => {
		const hasLowerCase = /[a-z]/;
		const hasUpperCase = /[A-Z]/;
		const hasSpecialChar = /[!@#$%^&*().?:{}|<>]/;

		if (!hasLowerCase.test(passwordInput)) {
			return {
				valid: false,
				message: "Password must contain at least one lowercase letter.",
			};
		}
		if (!hasUpperCase.test(passwordInput)) {
			return {
				valid: false,
				message: "Password must contain at least one uppercase letter.",
			};
		}
		if (!hasSpecialChar.test(passwordInput)) {
			return {
				valid: false,
				message:
					"Password must contain at least one special character.",
			};
		}
		return { valid: true, message: "" };
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Validate password
		const passwordValidation = isValidPassword(formData.password);
		if (!passwordValidation.valid) {
			setErrorMessage(passwordValidation.message);
			return; // Stop if password is invalid
		}

		if (formData.password === formData.confirmPassword) {
			const submitData = {
				firstName: formData.firstName,
				lastName: formData.lastName,
				password: formData.password,
				gender: formData.gender,
				birthDate: formData.birthDate,
				email: formData.email,
			};
			console.log(submitData);

			try {
				await post_registerUser(submitData);
				
				// 	alert("Registration successful. Please log in to your new account on the next page.");
				showToast({
					title: "Registration success",
					description: `Registration successful. Please log in to your new account on the next page.`,
					status: "success",
				});

				navigate("/login");
			} catch (error: any) {
				// check if the error has a message property and set it to errorMessage
				if (error && error.message) {
					setErrorMessage(`Registration failed: ${error.message}`);
				} else {
					setErrorMessage(
						"Registration failed: An unexpected error occurred."
					);
				}
			}
		} else {
			setErrorMessage("The passwords do not match.");
		}
	};

	return (
		<div className="global-container">
			<div className="form-container">
				<div className="register-container">
					<div className="registration-page-title">
						<h1>Registration</h1>
					</div>
					<form onSubmit={handleSubmit}>
						{step === 1 && (
							<>
								<p>First Name</p>
								<input
									type="text"
									name="firstName"
									placeholder="First Name"
									onChange={handleChange}
									value={formData.firstName}
									required
								/>
								<p>Last Name</p>
								<input
									type="text"
									name="lastName"
									placeholder="Last Name"
									onChange={handleChange}
									value={formData.lastName}
									required
								/>
								<p>Gender</p>
								<select
									name="gender"
									onChange={handleChange}
									value={formData.gender}
									required
								>
									<option value="">Select Gender</option>
									<option value="Male">Male</option>
									<option value="Female">Female</option>
									<option value="Other">Other</option>
								</select>
								{validationErrors.gender && (
									<div className="error-message">
										{validationErrors.gender}
									</div>
								)}
								<p>Birthdate</p>
								<input
									type="date"
									name="birthDate"
									onChange={handleChange}
									value={formData.birthDate}
									required
								/>
								{validationErrors.birthDate && (
									<div className="error-message">
										{validationErrors.birthDate}
									</div>
								)}
								<p>E-mail</p>
								<input
									type="email"
									name="email"
									placeholder="Email"
									onChange={handleChange}
									value={formData.email}
									required
								/>
								{validationErrors.email && (
									<div className="error-message">
										{validationErrors.email}
									</div>
								)}
								<div className="next-step-button">
									<button
										type="button"
										onClick={handleGoNextStep}
									>
										Next
									</button>
								</div>
							</>
						)}
						{step === 2 && (
							<>
								<p>Password</p>
								<input
									type="password"
									name="password"
									placeholder="Password"
									onChange={handleChange}
									value={formData.password}
									required
								/>
								<p>Confirm password</p>
								<input
									type="password"
									name="confirmPassword"
									placeholder="Confirm password"
									onChange={handleChange}
									value={formData.confirmPassword}
									required
								/>
								<div className="previous-step-button">
									<button
										type="button"
										onClick={handleGoPreviousStep}
									>
										Previous
									</button>
								</div>
								<div className="finish-registration-button">
									<button type="submit">
										Finish registration
									</button>
								</div>
							</>
						)}
					</form>
					{errorMessage && (
						<div className="error-message">{errorMessage}</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
