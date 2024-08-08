using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sparker.Models
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }
        public int Match_Id { get; set; }
        public int Sender_Id { get; set; } // or use appropriate type for User ID
        public int Receiver_Id { get; set; } // or use appropriate type for User ID
        public string Content { get; set; }
        public DateTime Time_Stamp { get; set; }

        // Navigation property for Match
        [ForeignKey("Match_Id")]
        public virtual Match Match { get; set; }
    }
}
