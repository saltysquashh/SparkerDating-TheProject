import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import "../styles/UserInfoPage.css";
import {
	delete_user,
	fetch_userInfo,
	update_userInfo,
} from "../services/userService";
import { AuthContext } from "../context/AuthContext";
import { Button } from "@chakra-ui/react";

const UserInfoPage = () => {
	const [user_Info, setUserInfo] = useState({
		firstName: "",
		lastName: "",
		birthdate: "",
		gender: "",
		email: "",
	});

	const [loading, setLoading] = useState(true);
	const { authUser, logout } = useContext(AuthContext);

	const handleUserInfoFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault(); // Prevent the default form submit action

		if (authUser && authUser.id) {
			try {
				await update_userInfo(authUser.id, user_Info);
				alert("User information updated successfully!");
			} catch (error: any) {
				// check if the error has a message property and set it to errorMessage
				if (error && error.message) {
					alert(`Updating user information failed: ${error.message}`);
				} else {
					alert("Updating user information: An unexpected error occurred.");
				}
			};
		}
	};

	const handleDeleteUser = async () => {
		if (authUser && authUser.id) {
			const confirmed = window.confirm(
				"Are you sure you want to delete your account?"
			);
			if (confirmed) {
				try {
					await delete_user(authUser.id, authUser.id); // user deletes themself
					alert("Your account has been deleted.");
					logout();
				} catch (error) {
					console.error("Error deleting account:", error);
					alert("Failed to delete your account.");
				}
			}
		}
	};

	useEffect(() => {
		if (authUser && authUser.id) {
			const getUserInfo = async () => {
				try {
					const data = await fetch_userInfo(authUser.id);

					let formattedBirthdate = data.birthdate;
					if (formattedBirthdate) {
						const date = new Date(formattedBirthdate);
						const userTimezoneOffset =
							date.getTimezoneOffset() * 60000;
						formattedBirthdate = new Date(
							date.getTime() - userTimezoneOffset
						)
							.toISOString()
							.split("T")[0];
					}

					setUserInfo({
						firstName: data.firstName || "",
						lastName: data.lastName || "",
						birthdate: formattedBirthdate || "",
						gender: data.gender || "",
						email: data.email || "",
					});
				} catch (error) {
					console.error("Error fetching user data:", error);
				}
				setLoading(false);
			};

			getUserInfo();
		}
	}, [authUser]);

	const handleUserInfoChange = (
		e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		setUserInfo({ ...user_Info, [e.target.name]: e.target.value });
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!authUser) {
		return <div>Error: No user data found. User is not logged in.</div>;
	}

	return (
		<div className="user-info-container">
			<div className="userinfo-page-title">
				<h2>User information</h2>
			</div>
			<div className="form-section">
				<form onSubmit={handleUserInfoFormSubmit}>
					<input
						type="text"
						name="firstName"
						value={user_Info.firstName}
						onChange={handleUserInfoChange}
						placeholder="First Name"
					/>
					<input
						type="text"
						name="lastName"
						value={user_Info.lastName}
						onChange={handleUserInfoChange}
						placeholder="Last Name"
					/>
					<input
						type="date"
						name="birthdate"
						value={user_Info.birthdate}
						onChange={handleUserInfoChange}
					/>
					<select
						name="gender"
						value={user_Info.gender}
						onChange={handleUserInfoChange}
					>
						<option value="Male">Male</option>
						<option value="Female">Female</option>
						<option value="Other">Other</option>
					</select>
					<input
						type="lockedemail"
						name="email"
						value={user_Info.email}
						readOnly // Lock the email field
						placeholder="Email"
					/>
					<Button type="submit" colorScheme="blue">
						Save
					</Button>
					<Button
						type="button"
						colorScheme="red"
						onClick={handleDeleteUser}
					>
						Delete
					</Button>
				</form>
			</div>
		</div>
	);
};


export default UserInfoPage;
