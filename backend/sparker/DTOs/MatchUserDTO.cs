namespace sparker.DTOs
{
    public class MatchUserDTO
    {
        public int MatchId { get; set; }
        public DateTime MatchedAt { get; set; }
        public int MatchedUserId { get; set; }
        public string MatchedName { get; set; }
        public string MatchedImageData { get; set; }
        public string MatchedUserBio { get; set; }
        public bool MatchIsGhosted { get; set; }
    }
}
