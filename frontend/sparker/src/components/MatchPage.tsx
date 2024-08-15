import React, { useState, useEffect, useContext } from 'react';
import '../styles/MatchPage.css';
import { fetch_ShowcaseUser } from '../services/userService';
import { fetchMatch, deleteMatch } from '../services/matchService';
import UserType from '../interfaces/UserInterface';
import MatchType from '../interfaces/MatchInterface'; 
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';

const MatchPage = () => {
    const { matchId } = useParams();
    const { matchUserId } = useParams();
    const [matchUserInfo, setUserInfo] = useState<UserType | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hoursLeftUser1, setHoursLeftUser1] = useState<number | null>(null);
    const [hoursLeftUser2, setHoursLeftUser2] = useState<number | null>(null);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const userId = user?.id;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const showcaseUser = await fetch_ShowcaseUser(matchUserId);
                setUserInfo(showcaseUser);
                setImages(showcaseUser.images || []);

                const match = await fetchMatch(matchId);
                calculateHoursLeft(match, user?.id, matchUserInfo?.id);

            } catch (error) {
                console.error('Error fetching match data:', error);
            }
            setIsLoading(false);
        };

        const calculateHoursLeft = (match: MatchType, userId?: number, matchUserId?: number) => {
            const now = new Date();

            if (match.lastMessageUser1) {
                const timeDifferenceUser1 = now.getTime() - new Date(match.lastMessageUser1).getTime();
                const hoursLeftBeforeGhostingUser1 = 24 - (timeDifferenceUser1 / (1000 * 60 * 60));
                setHoursLeftUser1(hoursLeftBeforeGhostingUser1 > 0 ? hoursLeftBeforeGhostingUser1 : 0);
            }

            if (match.lastMessageUser2) {
                const timeDifferenceUser2 = now.getTime() - new Date(match.lastMessageUser2).getTime();
                const hoursLeftBeforeGhostingUser2 = 24 - (timeDifferenceUser2 / (1000 * 60 * 60));
                setHoursLeftUser2(hoursLeftBeforeGhostingUser2 > 0 ? hoursLeftBeforeGhostingUser2 : 0);
            }
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
        <div className="match-page-container">
            <div className="match-header">
                <h2>{matchUserInfo.firstName} {matchUserInfo.lastName}</h2>
                <p className="match-bio">{matchUserInfo.bio}</p>
            </div>
            <div className="match-images-container">
                {images.map((image, index) => (
                    <div key={index} className="match-image-thumbnail">
                        <img src={`data:image/png;base64,${image}`} alt="Match" />
                    </div>
                ))}
            </div>

            <div className="match-actions">
                <Button onClick={handleChatClick} colorScheme='blue' className="action-button">Chat</Button>
                <Button onClick={onOpen} colorScheme='red' className="action-button">Unmatch</Button>
            </div>

            {hoursLeftUser1 !== null && (
                <div className="hours-left">
                    <p>{userId === matchUserId ? matchUserInfo.firstName : user?.firstName}: {hoursLeftUser1 > 0 ? `Hours left before ghosting: ${Math.floor(hoursLeftUser1)}` : 'This match is now ghosted.'}</p>
                </div>
            )}
            {hoursLeftUser2 !== null && (
                <div className="hours-left">
                    <p>{userId === matchUserId ? user?.firstName : matchUserInfo.firstName}: {hoursLeftUser2 > 0 ? `Hours left before ghosting: ${Math.floor(hoursLeftUser2)}` : 'This match is now ghosted.'}</p>
                </div>
            )}

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
    );
};

export default MatchPage;
