import React, { useState, useEffect, useContext } from 'react';
import '../styles/MatchesPage.css';
import { AuthContext } from '../context/AuthContext';
import { fetchUserMatches } from '../services/matchService';
import MatchType from '../interfaces/MatchInterface';
import { useNavigate } from 'react-router-dom';
import MatchUserType from '../interfaces/MatchUserInterface';

const MatchesPage = () => {
    const { user } = useContext(AuthContext);
    const [matcheUsers, setMatches] = useState<MatchUserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    
    useEffect(() => {
        const loadMatches = async () => {
            if (user) {
                setIsLoading(true);
                try {
                    const fetchedMatches = await fetchUserMatches(user.id);
                    setMatches(fetchedMatches);
                } catch (error) {
                    console.error('Error fetching matches:', error);
                }
                setIsLoading(false);
            }
        };
    
        loadMatches();
    }, [user]);

    const handleMatchClick = (matchId: number, matchUserId: number) => {
        navigate(`/matches/match/${matchId}/${matchUserId}`);
    };

    if (isLoading) {
        return <div className="loading-message-container">Loading matches...</div>;
    }

    if (matcheUsers.length === 0) {
        return <div className="no-matches-message-container">No matches found.</div>;
    }

    return (
        <div className="global-container">
            <div className="matches-page-container">
                <div className="matches-list-container">
                    <div className="matches-page-title">
                        <h1>Your Matches</h1>
                    </div>
                    <ul className="matches-list">
                        {matcheUsers.map((matchUser) => (
                            <li 
                                key={matchUser.matchedUserId} 
                                onClick={() => handleMatchClick(matchUser.matchId, matchUser.matchedUserId)} 
                                className="match-list-item">
                                <div className="match-item-details">
                                    <div className="match-item-image-container">
                                        {matchUser.matchedImageData ? (
                                            <img
                                                src={`data:image/png;base64,${matchUser.matchedImageData}`}
                                                alt={`${matchUser.matchedName}`}
                                                className="match-item-image"
                                            />
                                        ) : (
                                            <img
                                                src="/images/default-user-image.png" // Path to your default image
                                                alt="Default"
                                                className="match-item-image"
                                            />
                                        )}
                                    </div>
                                    <div className="match-item-info">
                                        <h2 className="match-item-name">
                                            {matchUser.matchedName}
                                        </h2>
                                        <p className="match-item-date">Matched on {new Date(matchUser.matchedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {matchUser.matchIsGhosted && (
                                    <img src="/images/ghosted-icon.png" alt="Ghosted" className="ghost-icon" /> // Render ghost icon if ghosted
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MatchesPage;
