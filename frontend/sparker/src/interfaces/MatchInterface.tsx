
import MatchUserType from "./MatchUserInterface";

interface MatchType {
    id: number;
    user1Id: number;
    user2Id: number;
    lastMessageUser1?: string;
    lastMessageUser2?: string;
    matchedAt: string;
    isGhosted: boolean;
    matchUser: MatchUserType;
}
export default MatchType;