interface MatchUserType {
    matchId: number;
    matchedAt: Date;
    matchedUserId: number;
    matchedName: string;
    matchedImageData: string;
    matchedUserBio: string;
    matchIsGhosted: boolean;
    lastMessageUser1: Date | null;
    lastMessageUser2: Date | null;
}

export default MatchUserType;
