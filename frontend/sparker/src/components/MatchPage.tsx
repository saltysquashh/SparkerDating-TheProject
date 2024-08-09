import React, { useState, useEffect, useContext } from 'react';
import '../styles/MatchPage.css';
import { fetch_UserInfo } from '../services/userService';
import { fetchUserImages } from '../services/imageService';
import { deleteMatch } from '../services/matchService';
import UserType from '../interfaces/UserInterface';
import ImageType from '../interfaces/ImageInterface';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, ButtonGroup, Checkbox, Stack, useDisclosure } from '@chakra-ui/react'
import { match } from 'assert';
import { AuthContext } from '../context/AuthContext';


const MatchPage = () => {
    const { matchId } = useParams();
    const { matchUserId } = useParams();
    const [matchUserInfo, setUserInfo] = useState<UserType | null>(null);
    const [images, setImages] = useState<ImageType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const userId = user?.id;

    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const matchUserInfo = await fetch_UserInfo(matchUserId); // kan disse calls ordnes i 1 request? (med en dto der samler modellerne)
                const userImages = await fetchUserImages(matchUserId); // kan disse calls ordnes i 1 request? (med en dto der samler modellerne)
                setUserInfo(matchUserInfo);
                setImages(userImages);
            } catch (error) {
                console.error('Error fetching match data:', error);
            }
            setIsLoading(false);
        };

        loadData();
    }, [matchUserId]);

    if (isLoading) {
        return <div className="match-page-loading">Loading...</div>;
    }

    if (!matchUserInfo) {
        return <div className="match-page-error">Match not found.</div>;
    }

    const handleChatClick = () => {
        console.log('Match clicked, their userId is: ', matchUserId);
        navigate(`/matches/match/${matchId}/chat/${matchUserId}`);
    };

    const handleUnmatchClick = async () => { // async da der foretages http kald

        try {
            const responseMsg = await deleteMatch(matchId, userId);
            // alert(responseMsg.data);
            
        } catch (error) {
            console.error("Error handling unmatch action:", error);
            // Handle the error appropriately
        }
        
        navigate(`/matches/`);
    };



    const handlePlanDateClick = () => {
      console.log('Date planner clicked, their userId is: ', matchUserId);
      navigate(`/matches/match/${matchId}/${matchUserId}/dateplanning`);
  };


  function getUserGeoLocation()
  {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
      });
    } else {
      alert('Error: Geolocation not available.')
    }
  }
    return (
        <div className="match-page-container">
            <h2>{matchUserInfo.firstName + ' ' + matchUserInfo.lastName}</h2>
            <p className="match-bio">{matchUserInfo.bio}</p>
            <div className="match-images-container">
                {images.map((image, index) => (
                    <div key={index} className="match-image-thumbnail">
                        <img src={`data:image/png;base64,${image.image_Data}`} alt="Match" />
                    </div>
                ))}
            </div>
            <Button onClick={() => handleChatClick()} colorScheme='blue'>Chat</Button>
            {/* <Button onClick={() => handleUnmatchClick()} colorScheme='red'>Unmatch</Button> */}
            <Button onClick={onOpen} colorScheme='red'>Unmatch</Button>
            <p>Need date ideas? Try the Date Planner function!</p>
            <Button onClick={() => handlePlanDateClick()} colorScheme='green'>Plan Date</Button>
       
<p>Where would you be open to go on a date with {matchUserInfo?.firstName}?</p>

<Stack spacing={5} direction='column'>
  <Checkbox colorScheme='green' defaultChecked>
    Park
  </Checkbox>
  <Checkbox colorScheme='green' defaultChecked>
    Coffee Shop
  </Checkbox>
  <Checkbox colorScheme='green' defaultChecked>
    Bar
  </Checkbox>
  <Checkbox colorScheme='green' defaultChecked>
    Wine Bar
  </Checkbox>
  <Checkbox colorScheme='green' defaultChecked>
    Cafe
  </Checkbox>
</Stack>
       <div className="Alert-Dialog-Example">
      <>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Unmatch
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this match? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={() => {
                handleUnmatchClick();
                onClose(); // This will close the dialog after the action
            }} ml={3}>
                Delete
                </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
            </div> 
    </div>
    );
};

export default MatchPage;
