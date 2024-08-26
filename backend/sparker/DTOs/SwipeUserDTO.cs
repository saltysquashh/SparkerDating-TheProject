namespace sparker.DTOs
{
        public class SwipeUserDTO
    {
            public int Id { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Gender { get; set; }
            public int Age { get; set; }
            public string Bio { get; set; }
            public List<string> Images { get; set; }
        }
}
