namespace sparker.DTOs
{
    namespace sparker.DTOs
    {
        public class ShowcaseUserDTO
        {
            public int Id { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Gender { get; set; }
            public int Age { get; set; }
            public string Bio { get; set; }
            public DateTime RegistrationAt { get; set; }
            public List<string> Images { get; set; }
        }
    }
}
