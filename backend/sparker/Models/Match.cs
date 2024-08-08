using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sparker.Models
{
    public class Match
    {
        [Key]
        public int Id { get; set; }
        public int User1_Id { get; set; }
        public int User2_Id { get; set; }
        public DateTime Matched_At { get; set; }

    }
}
