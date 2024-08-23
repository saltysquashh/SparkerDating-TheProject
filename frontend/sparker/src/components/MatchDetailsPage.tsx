import React, { useState, useEffect, useContext } from 'react';
import '../styles/MatchDetailsPage.css';
import { fetch_ShowcaseUser } from '../services/userService';
import { fetchMatch, deleteMatch } from '../services/matchService';
import UserType from '../interfaces/UserInterface';
import MatchType from '../interfaces/MatchInterface';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { calculateTimeLeft, formatDate } from '../utilities/dateUtils';

const MatchDetailsPage = () => {
    const { matchId, matchUserId } = useParams();
    const [matchUserInfo, setMatchUserInfo] = useState<UserType | null>(null);
    const [images, setImages] = useState<string[]>([]);

    const [timeLeftUser1, setTimeLeftUser1] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
    const [timeLeftUser2, setTimeLeftUser2] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
    const [matchInfo, setMatchInfo] = useState<MatchType | null>(null);
    const [createdAt, setCreatedAt] = useState<string | null>(null);
    const [isGhosted, setIsGhosted] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const userId = user?.id;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const loadData = async () => {
          
            try {
                const showcaseUser = await fetch_ShowcaseUser(matchUserId);
                setMatchUserInfo(showcaseUser);
                setImages(showcaseUser.images || []);

                const RetrievedMatchData = await fetchMatch(matchId);
                setMatchInfo(RetrievedMatchData);
                setCreatedAt(formatDate(RetrievedMatchData.matchedAt));

                const { timeLeftUser1, timeLeftUser2 } = calculateTimeLeft(RetrievedMatchData, user?.id, matchUserInfo?.id);
                setTimeLeftUser1(timeLeftUser1);
                setTimeLeftUser2(timeLeftUser2);

                setIsGhosted(RetrievedMatchData.isGhosted);
            } catch (error) {
                console.error('Error fetching match data:', error);
            }
            
        };

        loadData();

        const intervalId = setInterval(() => {
            if (matchInfo) {
                const { timeLeftUser1, timeLeftUser2 } = calculateTimeLeft(matchInfo, user?.id, matchUserInfo?.id);
                setTimeLeftUser1(timeLeftUser1);
                setTimeLeftUser2(timeLeftUser2);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [matchUserId, matchInfo, user, matchUserInfo]);


    if (!matchUserInfo) {
        return <div className="match-page-error">Match not found.</div>;
    }

    const handleChatClick = () => {
        navigate(`/matches/match/${matchId}/chat/${matchUserId}`);
    };

    const handleUnmatchClick = async () => {
        try {
            await deleteMatch(matchId, userId);
            navigate(`/matches/`);
        } catch (error) {
            console.error("Error handling unmatch action:", error);
        }
    };

    return (
        <div className="global-container">
            <div className="match-details-page-container">
                <div className="match-page-title">
                    <h2>Match</h2>
                </div>
                <div className="match-card-container">
                    <div className="match-header">
                        <div className="match-name-section">
                            <h2>{matchUserInfo.firstName} {matchUserInfo.lastName}</h2>
                        </div>
                        <div className="match-images-container">
                            {images.length > 0 ? (
                                images.map((image, index) => (
                                    <div key={index} className="match-image-thumbnail">
                                        <img src={`data:image/png;base64,${image}`} alt="Match" />
                                    </div>
                                ))
                            ) : (
                                <div className="match-image-thumbnail">
                                    <img src="/images/default-user-image.png" alt="Default" className="match-item-image" />
                                </div>
                            )}
                        </div>
                        <div className="match-bio-section">
                            <div className="match-bio-title">Bio</div>
                            <div className="match-bio-content">
                                <p>{matchUserInfo.bio}</p>
                            </div>
                        </div>
                        <div className="match-details-section">
                            <div className="match-details-title">
                                <h1>Details</h1>
                            </div>
                            <div className="match-detail-text">Age: {matchUserInfo?.age}</div>
                            <div className="match-detail-text">Gender: {matchUserInfo?.gender}</div>
                        </div>
                    </div>

                    <div className="match-status-section">
                        <div className="match-status-title">
                            <h1>Status</h1>
                        </div>
                        <div className="match-status-text">Matched at: {createdAt}</div>
                        {timeLeftUser1 && (
                            <p>
                                {userId === matchUserId ? matchUserInfo.firstName : user?.firstName}:
                                {` Time left before ghosting: ${timeLeftUser1.hours}h ${timeLeftUser1.minutes}m ${timeLeftUser1.seconds}s`}
                            </p>
                        )}
                        {timeLeftUser2 && (
                            <p>
                                {userId === matchUserId ? user?.firstName : matchUserInfo.firstName}:
                                {` Time left before ghosting: ${timeLeftUser2.hours}h ${timeLeftUser2.minutes}m ${timeLeftUser2.seconds}s`}
                            </p>
                        )}
                    </div>

                    <div className="match-actions">
                        {!isGhosted ? (
                            <Button onClick={handleChatClick} colorScheme='blue' className="action-button">Chat</Button>
                        ) : (
                            <Button colorScheme='gray' className="action-button" disabled>Locked</Button>
                        )}
                        <Button onClick={onOpen} colorScheme='red' className="action-button">Unmatch</Button>
                    </div>

                    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
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
                                        onClose();
                                    }} ml={3}>
                                        Delete
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialogOverlay>
                    </AlertDialog>
                </div>
            </div>
        </div> 
    );
};

export default MatchDetailsPage;
