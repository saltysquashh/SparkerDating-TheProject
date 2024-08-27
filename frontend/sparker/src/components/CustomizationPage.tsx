import React, { useState, useEffect, useContext } from "react";
import "../styles/CustomizationPage.css";
import ImageType from "../interfaces/ImageInterface";
import {
	fetchUserImages,
	deleteImage,
	uploadImage,
} from "../services/imageService";
import { AuthContext } from "../context/AuthContext";
import { Button, Textarea } from "@chakra-ui/react";
import {
	fetch_userCustomization,
	update_userBio,
} from "../services/userService";
import { useToastNotification } from "./globalComponents/toastProvider";
import { useErrorHandling } from "../hooks/useErrorHandling";

const CustomizationPage = () => {
	const [images, setImages] = useState<ImageType[]>([]);
	const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const { authUser } = useContext(AuthContext);
	const authUserId = authUser?.id;
	const [imageUrls, setImageUrls] = useState<{ [key: number]: string }>({});
	const [loading, setLoading] = useState(true);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [userBio, setUserBio] = useState("");

	const { handleError, clearError } = useErrorHandling();
	const showToast = useToastNotification();

	useEffect(() => {
		const getUserBio = async () => {
			if (!authUserId) {
				console.error("User ID is not available.");
				setLoading(false);
				return;
			}
			try {
				const response = await fetch_userCustomization(authUserId);
				setUserBio(response.bio || "");
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

		const loadImages = async () => {
			try {
				if (authUserId) {
					const fetchedImages = await fetchUserImages(authUserId);
					setImages(fetchedImages);
				}
			} catch (error) {
				const errorMessage = handleError(error);
				showToast({
					title: "Error",
					description: `${errorMessage}`,
					status: "error",
				});
			}
		};

		getUserBio();
		loadImages();

		return () => {
			Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
		};
	}, [authUserId]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			setSelectedFile(event.target.files[0]);
		}
	};

	const renderImageFromBlob = (image: ImageType) => {
		if (!imageUrls[image.id]) {
			let objectUrl = "data:image/png;base64," + image.image_Data;
			setImageUrls((prevUrls) => ({
				...prevUrls,
				[image.id]: objectUrl,
			}));
			return objectUrl;
		}
		return imageUrls[image.id];
	};

	const handleImageUpload = async () => {
		if (selectedFile && authUserId) {
			try {
				const response = await uploadImage(selectedFile, authUserId);
				setImages([...images, response]);
				setSelectedFile(null);
				setSuccessMessage("Image uploaded successfully");
			} catch (error) {
				const errorMessage = handleError(error);
				console.log("Err here: " + { errorMessage });
				showToast({
					title: "Error",
					description: `${errorMessage}`,
					status: "error",
				});
			}
		}
	};

	const handleImageDelete = async (imageId: number) => {
		try {
			await deleteImage(imageId);
			setImages(images.filter((image) => image.id !== imageId));
			setSuccessMessage("Image deleted successfully");
		} catch (error) {
			const errorMessage = handleError(error);
			showToast({
				title: "Error",
				description: `${errorMessage}`,
				status: "error",
			});
		}
	};

	const handleSaveBioClick = async () => {
		if (!authUserId) {
			return;
		}
		try {
			await update_userBio(authUserId, userBio);
		} catch (error) {
			const errorMessage = handleError(error);
			showToast({
				title: "Error",
				description: `${errorMessage}`,
				status: "error",
			});
		}
	};

	const viewFullImage = (image: ImageType) => {
		setSelectedImage(image);
	};

	const closeFullImageView = () => {
		setSelectedImage(null);
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="customization-page-container">
			<div className="customization-page-title">
				<h2>Customization</h2>
			</div>
			<div className="bio-section">
				<h2>Biography</h2>
				<Textarea
					placeholder="Hi. My name is Sparker and I like diving."
					value={userBio}
					onChange={(e) => setUserBio(e.target.value)}
				/>
				<Button onClick={handleSaveBioClick} colorScheme="blue" mt={4}>
					Save
				</Button>
			</div>

			<div className="image-upload-section">
				<h2>Your Images</h2>
				<div className="image-gallery">
					{images.map((image, index) => (
						<div key={index} className="image-thumbnail">
							<img
								src={renderImageFromBlob(image)}
								alt="User"
								onClick={() => viewFullImage(image)}
							/>
							<button onClick={() => handleImageDelete(image.id)}>
								Delete
							</button>
						</div>
					))}
				</div>
				<input
					type="file"
					onChange={handleFileChange}
					style={{ marginTop: "20px" }}
				/>
				<Button onClick={handleImageUpload} colorScheme="green" mt={4}>
					Upload Selected File
				</Button>
				{successMessage && (
					<p className="success-message">{successMessage}</p>
				)}
			</div>

			{selectedImage && (
				<div className="full-image-viewer" onClick={closeFullImageView}>
					<img
						src={renderImageFromBlob(selectedImage)}
						alt="Full View"
					/>
					<button onClick={closeFullImageView}>Close</button>
				</div>
			)}
		</div>
	);
};

export default CustomizationPage;
