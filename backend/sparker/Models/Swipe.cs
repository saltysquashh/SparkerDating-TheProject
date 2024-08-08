using System.ComponentModel.DataAnnotations;

namespace sparker.Models
{
    public class Swipe
    {
        [Key]
        public int Id { get; set; }
        public int Swiper_UserId { get; set; }
        public int Swiped_UserId { get; set; }
        public bool Liked { get; set; }
        public DateTime Swiped_At { get; set; }
    }
}
