import MatchType from '../interfaces/MatchInterface';

export const calculateTimeLeft = (match: MatchType, userId?: number, matchUserId?: number) => {
    const now = new Date();

    let timeLeftUser1: { hours: number; minutes: number; seconds: number } | null = null;
    let timeLeftUser2: { hours: number; minutes: number; seconds: number } | null = null;

    const calculateTimeDifference = (lastMessageTime: Date) => {
        const ghostingTime = new Date(lastMessageTime.getTime() + 24 * 60 * 60 * 1000);
        const timeDifference = ghostingTime.getTime() - now.getTime();
    
        if (timeDifference > 0) {
            const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
            const seconds = Math.floor((timeDifference / 1000) % 60);
            return { hours, minutes, seconds };
        }
        return null;
    };

    // set reference time
    var refTime1 = match.matchedAt;
    if (match.lastMessageUser1) {
        refTime1 = match.lastMessageUser1;
    }
    timeLeftUser1 = calculateTimeDifference(new Date(refTime1));

    var refTime2 = match.matchedAt;
    if (match.lastMessageUser2) {
        refTime2 = match.lastMessageUser2;
    }
    timeLeftUser2 = calculateTimeDifference(new Date(refTime2));


    return {
        timeLeftUser1,
        timeLeftUser2,
    };
};

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // Formats date to a more user-friendly format
};
