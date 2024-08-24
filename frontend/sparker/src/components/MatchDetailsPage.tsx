import React, { useState, useEffect, useContext } from 'react';
import '../styles/MatchDetailsPage.css';
import { deleteMatch, getMatchById } from '../services/matchService';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { calculateTimeLeft, formatDate } from '../utilities/dateUtils';
import MatchType from '../interfaces/MatchInterface';

const MatchDetailsPage = () => {
    const { matchId, matchUserId } = useParams();
    const [match, setMatch] = useState<MatchType | null>(null);
    const [timeLeftUser1, setTimeLeftUser1] = useState<string | null>(null);
    const [timeLeftUser2, setTimeLeftUser2] = useState<string | null>(null);
    const [createdAt, setCreatedAt] = useState<string | null>(null);
    const [isGhosted, setIsGhosted] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const userId = user?.id;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    const updateTimers = (matchData: MatchType) => {
        const { timeLeftUser1, timeLeftUser2 } = calculateTimeLeft(matchData, userId, matchData.matchUser?.id);
        
        setTimeLeftUser1(formatTimeLeft(timeLeftUser1));
        setTimeLeftUser2(formatTimeLeft(timeLeftUser2));
    };

    const formatTimeLeft = (timeLeft: { hours: number; minutes: number; seconds: number } | null): string => {
        if (!timeLeft || (timeLeft.hours <= 0 && timeLeft.minutes <= 0 && timeLeft.seconds <= 0)) {
            return "Any minute...";
        }

        const { hours, minutes, seconds } = timeLeft;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const RetrievedMatchData = await getMatchById(matchId, userId);
                setMatch(RetrievedMatchData);
                setCreatedAt(formatDate(RetrievedMatchData.matchedAt));
                updateTimers(RetrievedMatchData);
                setIsGhosted(RetrievedMatchData.isGhosted);
            } catch (error) {
                console.error('Error fetching match data:', error);
            }
        };

        const intervalLoadData = setInterval(loadData, 45000);

        loadData();  // Initial load

        return () => clearInterval(intervalLoadData);
    }, [matchId, userId]);

    useEffect(() => {
        const intervalTimeLeft = setInterval(() => {
            if (match) {
                updateTimers(match);
            }
        }, 1000);

        return () => clearInterval(intervalTimeLeft);
    }, [match]);

    if (!match || !match.matchUser) {
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
                            <h2>{match.matchUser.fullName}</h2>
                        </div>
                        <div className="match-images-container">
                            {match.matchUser.images.length > 0 ? (
                                match.matchUser.images.map((image, index) => (
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
                                <p>{match.matchUser.bio}</p>
                            </div>
                        </div>
                        <div className="match-details-section">
                            <div className="match-details-title">
                                <h1>Details</h1>
                            </div>
                            <div className="match-detail-text">Age: {match.matchUser.age}</div>
                            <div className="match-detail-text">Gender: {match.matchUser.gender}</div>
                        </div>
                    </div>

                    <div className="match-status-section">
                        <div className="match-status-title">
                            <h1>Ghosting Status</h1>
                        </div>

                        <div className="time-left-title">Time left before ghosting:</div>
                        <p>
                            {userId === match.user1Id ? "You" : match.matchUser.fullName}: {timeLeftUser1}
                        </p>
                        <p>
                            {userId === match.user2Id ? "You" : match.matchUser.fullName}: {timeLeftUser2}
                        </p>
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
                    <div className="matched-at-text">You matched with {match.matchUser.fullName} on {createdAt}</div>
                </div>
            </div>
        </div>
    );
};

export default MatchDetailsPage;
