interface SwipeHistoryType {
    id: number;
    swipedUserId: number;
    swipedName: string;
    swipedAge: number;
    swipedGender: string;
    swipedBio: string;
    swipedImageData: string;
    swipedAt: Date;
    liked: boolean;
    isMatch: boolean;
}

export default SwipeHistoryType