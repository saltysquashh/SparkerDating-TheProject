using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace sparker.Models
{
    public class Ghost
    {
        [Key, ForeignKey("Match")]
        [DatabaseGenerated(DatabaseGeneratedOption.None)] // disable auto-increment since it's a shared ID with match.
        public int Match_Id { get; set; }

        public DateTime Ghosted_At { get; set; }
        public int Ghosted_By { get; set; }

        // Navigation property for the one-to-one relationship
        public virtual Match Match { get; set; }
    }
}
