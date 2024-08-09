using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sparker.Models
{
    public class Admin
    {
        [Key]
        [Required]
        public int User_Id { get; set; }

        [ForeignKey("User_Id")]
        public virtual User User { get; set; }
    }
}