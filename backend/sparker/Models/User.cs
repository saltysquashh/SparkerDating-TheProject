using System.ComponentModel.DataAnnotations;

namespace sparker.Models
{
    public class User
    {
        [Key]
        [Required]
        public int Id { get; set; }
        public string? First_Name { get; set; }
        public string? Last_Name { get; set; }
        public string? Gender { get; set; }
        public string? Email { get; set; }
        public string? Password_Hash { get; set; }
        public DateTime Birthdate { get; set; }
        public string? Bio { get; set; }
        public DateTime Registration_At { get; set; }
        public DateTime Last_Login_At { get; set; }
        public virtual Preference Preference { get; set; }
    }
}


