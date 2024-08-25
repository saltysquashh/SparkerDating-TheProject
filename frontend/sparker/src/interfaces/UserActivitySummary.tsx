import MatchType from "./MatchInterface";


interface UserActivitySummaryDTO {
    newMatches: MatchType[];
    expiredMatches: MatchType[];
}

export default UserActivitySummaryDTO