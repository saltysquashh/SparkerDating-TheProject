namespace sparker.DTOs
{
    public class UserActivitySummaryDTO
    {
        public List<MatchDTO> NewMatches { get; set; }
        public List<MatchDTO> ExpiredMatches { get; set; }
    }
}
