namespace sparker.DTOs
{
    public class SwipeHistoryDTO
    {
        public int Id { get; set; }
        public int SwipedUserId { get; set; }
        public string SwipedName { get; set; }
        public string SwipedGender { get; set; }
        public int SwipedAge {  get; set; }
        public string SwipedBio { get; set; }
        public string SwipedImageData { get; set; }
        public DateTime SwipedAt { get; set; }
        public bool Liked { get; set; }
        public bool IsMatch { get; set; }
    }
}
