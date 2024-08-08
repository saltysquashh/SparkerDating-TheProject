namespace sparker.DTOs
{
    public class CreatePreferenceDTO
    {
        public int UserId { get; set; }
        public string? Sex { get; set; }
        public int? AgeMin { get; set; }
        public int? AgeMax { get; set; }
    }
}
