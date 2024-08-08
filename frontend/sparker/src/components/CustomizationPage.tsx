import React, { useState, useEffect, useContext, ChangeEvent } from 'react';
import '../styles/CustomizationPage.css';
import ImageType from '../interfaces/ImageInterface';
import { fetchUserImages, deleteImage, uploadImage } from '../services/imageService';
import { AuthContext } from '../context/AuthContext';
import { Button, Textarea } from '@chakra-ui/react'
import { fetch_UserBio, update_UserBio } from '../services/userService';

const ImagePage = () => {
    const [images, setImages] = useState<ImageType[]>([]);
    const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { user } = useContext(AuthContext);
    const userId = user?.id;
    const [imageUrls, setImageUrls] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);

    const [user_Bio, setUserBio] = useState({
        bio: '',
    });


    useEffect(() => {
        const getUserBio = async () => {
            if (!userId) {
                console.error("User ID is not available.");
                setLoading(false);
                return;
            }
        
            try {
                const response = await fetch_UserBio(userId);
                console.log("Fetched Bio:", response);
        
                setUserBio({ 
                    bio: response.bio || ''
                });
            } catch (error) {
                console.error('Error fetching user bio:', error);
            }
            setLoading(false);
        };
        
        getUserBio();

        const loadImages = async () => {
            try {
                if (userId) {
                    const fetchedImages = await fetchUserImages(userId);
                    console.log(fetchedImages); // Log to check the data
                    setImages(fetchedImages);
                }
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };
    
        loadImages();

        return () => {
            Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
        };
    }, [userId]);



    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    // const convertToBlob = (base64: string): Blob => {
    //     const byteString = atob(base64.split(',')[1]);
    //     const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    //     const ab = new ArrayBuffer(byteString.length);
    //     const ia = new Uint8Array(ab);
    
    //     for (let i = 0; i < byteString.length; i++) {
    //         ia[i] = byteString.charCodeAt(i);
    //     }
    
    //     return new Blob([ab], { type: mimeString });
    // };


    const renderImageFromBlob = (image: ImageType) => {
        // Check if the URL is already created
        

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
                alert('Image uploaded successfully.');
                
                setSelectedFile(null);
            } catch (error) {
                console.error('Error uploading the image:', error);
            }
        }
    };
 

    const handleImageDelete = async (imageId: number) => {
        if (imageUrls[imageId]) {
            URL.revokeObjectURL(imageUrls[imageId]);
            setImageUrls(prevUrls => {
                const newUrls = { ...prevUrls };
                delete newUrls[imageId];
                return newUrls;
            });
        }
        await deleteImage(imageId);
        setImages(images.filter(image => image.id !== imageId));
    };

    const handleSaveBioClick = async () => {
        if (!userId) {
            console.error("User ID is not available.");
            return;
        }

        try {
            const bioData = { bio: user_Bio.bio };
            const response = await update_UserBio(userId, bioData);
            console.log(response);
            alert('Bio updated successfully');
        } catch (error) {
            console.error('Error updating bio:', error);
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
            <div className="bio-section">
                <h2>Your profile bio</h2>
                <Textarea 
                    placeholder='Here is a sample placeholder'
                    value={user_Bio.bio}
                    onChange={(e) => setUserBio({...user_Bio, bio: e.target.value})}
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
        </div>
    </div>
);
            }

export default ImagePage;
