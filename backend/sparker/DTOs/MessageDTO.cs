namespace sparker.DTOs
{
    public class MessageDTO
    {
        public int MessageId { get; set; }
        public int SenderId { get; set; }
        public string Content { get; set; }
        public DateTime TimeStamp { get; set; }
        public string SenderName { get; set; }
    }
}
