using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sparker.Models
{
    public class Preference
    {
        [Key]
        [ForeignKey("User")] // one-to-one
        [Required]
        public int User_Id { get; set; } // PK
        public string? Sex { get; set; }
        public int? Age_Min { get; set; }
        public int? Age_Max { get; set; }

        
        // Foreign key for User
        public User User { get; set; }
        // public virtual User User { get; set; } // Navigation property (i stedet for linjen over?)

    }
}
