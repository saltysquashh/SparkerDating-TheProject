// UserInfoPage.tsx
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import '../styles/UserInfoPage.css';
import { fetch_UserInfo, update_UserInfo } from '../services/userService';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@chakra-ui/react';


const UserInfoPage = () => {
    
    const [user_Info, setUserInfo] = useState({
        firstName: '',
        lastName: '',
        birthdate: '',
        gender: '',
        email: ''
    });

        const [loading, setLoading] = useState(true);
        const { user } = useContext(AuthContext);


        const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault(); // Prevent the default form submit action
    
            if (user && user.id) {
                try {
                    await update_UserInfo(user.id, user_Info); // Call the update function
                    alert('User information updated successfully!');
                    // Optionally, refresh the user info or navigate to another page
                } catch (error) {
                    console.error('Error updating user information:', error);
                    alert('Failed to update user information.');
                }
            }
        };

        useEffect(() => {
            if (user && user.id) {
                const getUserInfo = async () => {
                    try {
                        const data = await fetch_UserInfo(user.id); // Fetch user data based on user id
                        
                        let formattedBirthdate = data.birthdate;
                        if (formattedBirthdate) {
                            const date = new Date(formattedBirthdate);
                            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                            formattedBirthdate = new Date(date.getTime() - userTimezoneOffset).toISOString().split('T')[0];
                        }

                        setUserInfo({ 
                            firstName: data.firstName || '',
                            lastName: data.lastName || '',
                            birthdate: formattedBirthdate || '',
                            gender: data.gender || '',
                            email: data.email || ''
                        }); // Update form fields with fetched data
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                    }
                    setLoading(false);
                };
            
                getUserInfo();
            }
        }, [user]);

        const handleUserInfoChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setUserInfo({ ...user_Info, [e.target.name]: e.target.value });
        };

    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!user) {
        return <div>No user data found.</div>;
    }


    return (

        <div className="user-info-container">
            <div className='userinfo-page-title'>
            <h2>Main User information</h2>
            </div>
            <div className="form-section">
                {/* <h2>User information</h2> */}
                <form onSubmit={handleFormSubmit}>
            
                    <input type="text" name="firstName" value={user_Info.firstName} onChange={handleUserInfoChange} placeholder="First Name" />
                    <input type="text" name="lastName" value={user_Info.lastName} onChange={handleUserInfoChange} placeholder="Last Name" />
                    <input type="date" name="birthdate" value={user_Info.birthdate} onChange={handleUserInfoChange} />
                    <select name="gender" value={user_Info.gender} onChange={handleUserInfoChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    <input type="email" name="email" value={user_Info.email} onChange={handleUserInfoChange} placeholder="Email" />
                    <Button type="submit" colorScheme='blue'>Save</Button>
                </form>
        </div>
        </div>
    );
}


export default UserInfoPage;