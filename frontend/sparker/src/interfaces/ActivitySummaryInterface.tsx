import MatchType from "./MatchInterface";


interface ActivitySummaryDTO {
    newMatches: MatchType[];
    expiredMatches: MatchType[];
}

export default ActivitySummaryDTO