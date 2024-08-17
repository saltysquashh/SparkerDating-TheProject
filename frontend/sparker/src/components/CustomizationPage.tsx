import React, { useState, useEffect, useContext, ChangeEvent } from 'react';
import '../styles/CustomizationPage.css';
import ImageType from '../interfaces/ImageInterface';
import { fetchUserImages, deleteImage, uploadImage } from '../services/imageService';
import { AuthContext } from '../context/AuthContext';
import { Button, Textarea } from '@chakra-ui/react'
import { fetch_UserCustomization, update_UserBio } from '../services/userService';

const CustomizationPage = () => {
    const [images, setImages] = useState<ImageType[]>([]);
    const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { user } = useContext(AuthContext);
    const userId = user?.id;
    const [imageUrls, setImageUrls] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // thestate to hold the success message
    const [userBio, setUserBio] = useState('');
    useEffect(() => {
        
        const getUserBio = async () => {
            if (!userId) {
                console.error("User ID is not available.");
                setLoading(false);
                return;
            }
        
            try {
                const response = await fetch_UserCustomization(userId);
        
                setUserBio(response.bio || '');
            } catch (error) {
                console.error('Error fetching user bio:', error);
            }
            setLoading(false);
        };

        const loadImages = async () => {
            try {
                if (userId) {
                    const fetchedImages = await fetchUserImages(userId);

                    setImages(fetchedImages);
                }
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };
        
        getUserBio();
        loadImages();

        return () => {
            // revoke all object URLs whn cleaning up
            Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
        };
    }, [userId]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const renderImageFromBlob = (image: ImageType) => {

        if (!imageUrls[image.id]) {
            // let blobData;
    
            let objectUrl = 'data:image/png;base64,' + image.image_Data;

            setImageUrls(prevUrls => ({ ...prevUrls, [image.id]: objectUrl }));

            return objectUrl;
        }
        
        return imageUrls[image.id];
    };

    const handleImageUpload = async () => {
        if (selectedFile && userId) {
            try {
                const response = await uploadImage(selectedFile, userId);
                setImages([...images, response]);
                // alert('Image uploaded successfully.');
                setSelectedFile(null);
                setSuccessMessage('Saved image changes successfully');
            } catch (error) {
                console.error('Error uploading the image:', error);
            }
        }
    };
 

    const handleImageDelete = async (imageId: number) => {
        try {
            await deleteImage(imageId);
            setImages(images.filter(image => image.id !== imageId));
            setSuccessMessage('Saved image changes successfully'); // Show success message
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const handleSaveBioClick = async () => {
        if (!userId) {
            console.error("User ID is not available.");
            return;
        }
        try {
            const bioData = userBio;
            const response = await update_UserBio(userId, bioData);

        } catch (error) {
            alert('Error updating bio');
        }
    };


    const viewFullImage = (image: ImageType) => {
        setSelectedImage(image);
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
                <h2>Your profile bio</h2>
                <Textarea 
                    placeholder='Hi. My name is Sparker and i like diving.'
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                />
                <Button onClick={handleSaveBioClick} colorScheme='blue'>Save bio</Button>
            </div>
        <h2>Your images</h2>
        <div className="image-gallery">
            {images.map((image, index) => (
                <div key={index} className="image-thumbnail">
                    <img src={renderImageFromBlob(image)} alt="User" onClick={() => viewFullImage(image)} />
                    <button onClick={() => handleImageDelete(image.id)}>Delete</button>
                </div>
            ))}
        </div>
        {selectedImage && (
            <div className="full-image-viewer">
                <img src={selectedImage.image_Data instanceof Blob ? imageUrls[selectedImage.id] : selectedImage.image_Data} alt="Full View" />
                <button onClick={() => { 
                    if (selectedImage.image_Data instanceof Blob && imageUrls[selectedImage.id]) {
                        URL.revokeObjectURL(imageUrls[selectedImage.id]);
                        setImageUrls(prevUrls => {
                            const newUrls = { ...prevUrls };
                            delete newUrls[selectedImage.id];
                            console.log('newUrls:' + newUrls);
                            return newUrls;
                        });
                    }
                    setSelectedImage(null);
                }}>Close</button>
            </div>
            
        )}
            <div className="image-upload-section">
            
            <input type="file" onChange={handleFileChange} />
            <Button onClick={handleImageUpload} colorScheme='green'>Upload Selected Picture</Button>
            {successMessage && <p className="success-message">{successMessage}</p>}
        </div>
    </div>
   
);
            }

export default CustomizationPage;
