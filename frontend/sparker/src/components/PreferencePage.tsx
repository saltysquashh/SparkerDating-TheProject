// PreferencePage.tsx
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import "../styles/PreferencePage.css"; // Import the CSS file
import {
	fetch_UserPreferences,
	update_UserPreferences,
} from "../services/preferenceService";
import { AuthContext } from "../context/AuthContext";
import {
	Box,
	Button,
	RangeSlider,
	RangeSliderFilledTrack,
	RangeSliderThumb,
	RangeSliderTrack,
	useToast,
} from "@chakra-ui/react";
import { useToastNotification } from "./providers/toastProvider";
import { useErrorHandling } from "../hooks/useErrorHandling";

const PreferencePage = () => {
	const [loading, setLoading] = useState(true);
	const { authUser } = useContext(AuthContext);

	const { handleError, clearError } = useErrorHandling();
	const showToast = useToastNotification();

	const [userPreferences, setUserPreferences] = useState({
		sex: "",
		ageMin: 18,
		ageMax: 99,
		// ageRange: [18, 99] // Initialize with default age range
	});

	const [ageRange, setAgeRange] = useState([18, 99]);

	useEffect(() => {
		if (authUser && authUser.id) {
			const getUserPref = async () => {
				try {
					const data = await fetch_UserPreferences(authUser.id); // Fetch user data based on user id
					setUserPreferences({
						sex: data.sex || "",
						ageMin: data.ageMin || 18,
						ageMax: data.ageMax || 99, // Assuming data contains these fields
					}); // Update form fields with fetched data

					setAgeRange([data.ageMin || 18, data.ageMax || 99]);
				} catch (error) {
					const errorMessage = handleError(error);
					showToast({
						title: "Error",
						description: `${errorMessage}`,
						status: "error",
					});
				}
				setLoading(false);
			};

			getUserPref();
		}
	}, [authUser]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!authUser) {
		return <div>No user data found.</div>;
	}

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault(); // prevent the default form submit action

		if (authUser && authUser.id) {
			try {
				await update_UserPreferences(authUser.id, userPreferences);
				alert("User preferences were updated succesfully.");
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

	const handleUserPreferencesChange = (
		e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		setUserPreferences({
			...userPreferences,
			[e.target.name]: e.target.value,
		});
	};

	const handleAgeSliderChange = (sliderValue: number[]) => {
		setUserPreferences({
			...userPreferences,
			ageMin: sliderValue[0],
			ageMax: sliderValue[1],
		});
	};

	return (
		<div className="preference-container">
			<div className="preference-page-title">
				<h2>Preferences</h2>
			</div>
			<div className="form-section">
				<h2>Match preferences</h2>
				<form onSubmit={handleFormSubmit}>
					<select
						name="sex"
						value={userPreferences.sex}
						onChange={handleUserPreferencesChange}
					>
						<option value="Both">Both</option>
						<option value="Male">Male</option>
						<option value="Female">Female</option>
					</select>
					<div>
						<RangeSlider
							defaultValue={ageRange}
							min={18}
							max={99}
							step={1}
							onChangeEnd={(val) => handleAgeSliderChange(val)}
						>
							<RangeSliderTrack bg="red.100">
								<RangeSliderFilledTrack bg="tomato" />
							</RangeSliderTrack>
							<RangeSliderThumb boxSize={6} index={0} />
							<RangeSliderThumb boxSize={6} index={1} />
						</RangeSlider>
					</div>
					<p>Min Age: {userPreferences.ageMin}</p>
					<p>Max Age: {userPreferences.ageMax}</p>
					<Button type="submit" colorScheme="blue">
						Save
					</Button>
				</form>
			</div>
		</div>
	);
};

export default PreferencePage;
