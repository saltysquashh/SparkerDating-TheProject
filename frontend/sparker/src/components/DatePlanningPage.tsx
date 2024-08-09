import React, { useState, useEffect, useContext } from 'react';
import '../styles/MatchPage.css';
import { fetch_UserInfo } from '../services/userService';
import { fetchUserImages } from '../services/imageService';
import { deleteMatch } from '../services/matchService';
import UserType from '../interfaces/UserInterface';
import ImageType from '../interfaces/ImageInterface';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, ButtonGroup, Checkbox, Stack, Step, StepDescription, StepIcon, StepIndicator, StepNumber, StepSeparator, StepStatus, StepTitle, Stepper, useDisclosure, useSteps } from '@chakra-ui/react'
import { match } from 'assert';
import { AuthContext } from '../context/AuthContext';
import { steps } from 'framer-motion';
import { render } from 'react-dom';

const DatePlanningPage = () => {
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


    const steps = [
      { title: 'First', description: 'Contact Info' },
      { title: 'Second', description: 'Date & Time' },
      { title: 'Third', description: 'Select Rooms' },
    ]
    const { activeStep, setActiveStep} = useSteps({
      index: 1,
      count: steps.length,
    })

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const matchUserInfo = await fetch_UserInfo(matchUserId);
                setUserInfo(matchUserInfo);
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



  // function getUserGeoLocation()
  // {
  //   if ("geolocation" in navigator) {
  //     navigator.geolocation.getCurrentPosition(function(position) {
  //       var latitude = position.coords.latitude;
  //       var longitude = position.coords.longitude;
  //     });
  //   } else {
  //     alert('Error: Geolocation not available.')
  //   }
  // }
  
  

    return (
      <div className="planner-stepper">
<Stepper size='lg' index={activeStep} orientation='vertical'>
      {steps.map((step, index) => (
        <Step key={index} onClick={() => setActiveStep(index)}>
          <StepIndicator>
            <StepStatus
              complete={<StepIcon />}
              incomplete={<StepNumber />}
              active={<StepNumber />}
            />
          </StepIndicator>

          <Box flexShrink='0'>
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </Box>

          <StepSeparator />
        </Step>
      ))}
    </Stepper>
      </div>
    )
  }



export default DatePlanningPage;
