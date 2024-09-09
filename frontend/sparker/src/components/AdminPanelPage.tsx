import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/AdminPanelPage.css";
import UserType from "../interfaces/UserInterface";
import {
	delete_user,
	post_demoteAdminToUser,
	fetch_allUsers,
	post_promoteUserToAdmin,
} from "../services/userService";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
	ButtonGroup,
	Checkbox,
	Stack,
	useDisclosure,
} from "@chakra-ui/react";
import { useToastNotification } from "./providers/toastProvider";
import { useErrorHandling } from "../hooks/useErrorHandling";
import { formatDate } from "../utilities/dateUtils";

const AdminPanelPage = () => {
	const { authUser } = useContext(AuthContext);
	const navigate = useNavigate();
	const [users, setUsers] = useState<UserType[]>([]);

	const { handleError, clearError } = useErrorHandling();
	const showToast = useToastNotification();

	useEffect(() => {
		if (!authUser) {
			// Redirect to login page or any other page
			alert("You are not logged in.");
			navigate("/login");
		}

		const loadUsers = async () => {
			if (authUser) {
				try {
					const fetchedUsers = await fetch_allUsers();
					setUsers(fetchedUsers);
					console.log("Fetched Matches:", fetchedUsers); // Log the fetched matches
				} catch (error) {
					const errorMessage = handleError(error);
					showToast({
						title: "Error",
						description: `${errorMessage}`,
						status: "error",
					});
				}
			}
		};
		loadUsers();
	}, [authUser, navigate]);

	const handleUserClick = (userId: number) => {
		navigate(`/adminpanel/restore/${userId}`);
	};

	const handleUserDelete = async (delUserId: number, byUserId: number) => {
		try {
			const response = await delete_user(delUserId, byUserId);
			// navigate(`/adminpanel`); // ikke her, men først når knappet er lavet inde på user details
			// alert(response);

			showToast({
				title: "User deleted",
				description:
					"The user was deleted successfully.",
				status: "success",
			});

			setUsers((prevUsers) =>
				prevUsers.filter((u) => u.id !== delUserId)
			); // prevUsers is the previous state of the 'users' array
		} catch (error) {
			const errorMessage = handleError(error);
			showToast({
				title: "Error",
				description: `${errorMessage}`,
				status: "error",
			});
		}
	};

	const handleUserPromote = async (userId: number, byUserId: number) => {
		try {
			const response = await post_promoteUserToAdmin(userId, byUserId);
			// alert(response);

			showToast({
				title: "User promoted",
				description:
					`${response}`,
				status: "success",
			});
			setUsers((prevUsers) =>
				prevUsers.map((u) =>
					u.id === userId ? { ...u, isAdmin: true } : u
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

	const handleUserDemote = async (adminUserId: number, byUserId: number) => {
		try {
			const response = await post_demoteAdminToUser(adminUserId, byUserId);
			// alert(response);
			showToast({
				title: "User demoted",
				description:
					`${response}`,
				status: "success",
			});
			setUsers((prevUsers) =>
				prevUsers.map((u) =>
					u.id === adminUserId? { ...u, isAdmin: false, isMaster: false }: u
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

	if (!authUser?.isAdmin) {
		return (
			<div className="unauthorized-container">
				You are not authorized as an admin.
			</div>
		);
	}

	if (!authUser) {
		return <div>Loading...</div>; // Show loading or redirect until user is validated
	}

	return (
		<div className="global-container">
			<div className="admin-panel-container">
				<div className="admin-panel-title">
					<h1>Admin Panel</h1>
				</div>
				<p>
					Welcome, {authUser.firstName}! You have administrative
					access.
				</p>
				<h2>All Users:</h2>
				<ul className="user-list">
					{users.map((shownUser) => (
						<li
							key={shownUser.id}
							className="user-item"
							onClick={() => handleUserClick(shownUser.id)}
						>
							<div>Id: {shownUser.id}</div>
							<div>First name: {shownUser.firstName}</div>
							<div>Last name: {shownUser.lastName}</div>
							<div>
								Registration date:{" "}
								{formatDate(shownUser.registrationAt)}
							</div>
							<div>
								Type: {shownUser.isAdmin ? "Admin" : "User"}
								{shownUser.isMaster ? " (Master)" : ""}
							</div>
							{!shownUser.isMaster && (
								<div className="admin-panel-buttons">
									{!shownUser.isAdmin && (
										<Button
											onClick={(event) => {
												event.stopPropagation();
												handleUserPromote(
													shownUser.id,
													authUser.id
												);
											}}
											colorScheme="green"
										>
											Promote to Admin
										</Button>
									)}
									{shownUser.isAdmin && (
										<Button
											onClick={(event) => {
												event.stopPropagation();
												handleUserDemote(
													shownUser.id,
													authUser.id
												);
											}}
											colorScheme="yellow"
										>
											Demote to User
										</Button>
									)}
									{!shownUser.isAdmin && (
										<Button
											onClick={(event) => {
												event.stopPropagation();
												handleUserDelete(
													shownUser.id,
													authUser.id
												);
											}}
											colorScheme="red"
										>
											Delete
										</Button>
									)}
								</div>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default AdminPanelPage;
