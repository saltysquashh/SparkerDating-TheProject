interface MatchType {
    matchId: number;
    matchedAt: Date;
    matchedUserId: number;
    matchedName: string;
    imageData: Blob | string;
    matchedUserBio: string;
}

export default MatchType;
