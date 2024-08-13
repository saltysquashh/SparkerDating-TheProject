namespace sparker.DTOs
{
    public class MessageDTO
    {
        public int MessageId { get; set; }
        public int SenderId { get; set; }
        public string Content { get; set; }
        public DateTime Time_Stamp { get; set; }
        public string SenderName { get; set; }
    }
}
