namespace sparker.DTOs
{
    public class LoginResponseDTO
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Token { get; set; }
        public bool IsAdmin { get; set; }
    }
}
