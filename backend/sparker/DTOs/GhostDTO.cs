namespace sparker.DTOs
{
    public class GhostDTO
    {
        public int MatchId { get; set; }
        public DateTime GhostedAt { get; set; }
        public int GhostedBy { get; set; }
    }
}
