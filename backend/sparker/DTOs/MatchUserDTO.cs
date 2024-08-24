﻿namespace sparker.DTOs
{

    public class MatchUserDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Gender { get; set; }
        public int Age { get; set; }
        public string Bio { get; set; }
        public List<string> Images { get; set; }
    }
}
