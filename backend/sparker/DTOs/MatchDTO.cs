namespace sparker.DTOs
{
    public class MatchDTO
    {
        public int Id { get; set; }
        public int User1Id { get; set; }
        public int User2Id { get; set; }
        public DateTime? LastMessageUser1 { get; set; }
        public DateTime? LastMessageUser2 { get; set; }
        public DateTime? MatchedAt { get; set; }
        public bool IsGhosted { get; set; }
        public MatchUserDTO? MatchUser { get; set; }
    }
}
