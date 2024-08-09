import React, { useState, useEffect, useContext } from 'react';
import '../styles/MatchesPage.css';
import { AuthContext } from '../context/AuthContext';
import { fetchUserMatches } from '../services/matchService';
import MatchType from '../interfaces/MatchInterface';
import { useNavigate } from 'react-router-dom';

const MatchesPage = () => {
    const { user } = useContext(AuthContext);
    const [matches, setMatches] = useState<MatchType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    
    useEffect(() => {
        const loadMatches = async () => {
            if (user) {
                setIsLoading(true);
                try {
                    const fetchedMatches = await fetchUserMatches(user.id);
                    setMatches(fetchedMatches);
                    console.log("Fetched Matches:", fetchedMatches); // Log the fetched matches
                } catch (error) {
                    console.error('Error fetching matches:', error);
                }
                setIsLoading(false);
            }
        };
    
        loadMatches();
    }, [user]);

    const handleMatchClick = (matchId: number, matchUserId: number) => {
        console.log('Match clicked, their userId is: ', matchUserId);
        navigate(`/matches/match/${matchId}/${matchUserId}`);
    };

    if (isLoading) {
        return <div>Loading matches...</div>;
    }

    if (matches.length === 0) {
        return <div>No matches found.</div>;
    }

    return (
        <div className="global-container">
        <div className="matches-container">
            <h2>Your Matches</h2>
            <ul className="match-list">
                {matches.map((match) => (
                    <li key={match.matchedUserId} onClick={() => handleMatchClick(match.matchId, match.matchedUserId)} className="match-item">
                        {match.imageData && <img src={`data:image/png;base64,${match.imageData}`} alt={`${match.matchedName}`} className="match-image" />}
                        {match.matchedName} - You matched with {match.matchedName} on {new Date(match.matchedAt).toLocaleDateString()}
                    </li>
                ))}
            </ul>
        </div>
        </div>
    );
};

export default MatchesPage;
