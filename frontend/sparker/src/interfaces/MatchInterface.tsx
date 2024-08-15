interface MatchType {
    matchId: number;
    matchedAt: Date;
    matchedUserId: number;
    matchedName: string;
    imageData: Blob | string;
    matchedUserBio: string;
    isGhosted: boolean;
    lastMessageUser1: Date | null;
    lastMessageUser2: Date | null;
}

export default MatchType;
