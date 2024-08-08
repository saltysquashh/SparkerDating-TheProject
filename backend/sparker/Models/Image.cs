using System.ComponentModel.DataAnnotations;

namespace sparker.Models
{
    public class Image
    {
        [Key]
        public int Id { get; set; } // PK
        public int User_Id { get; set; }
        public byte[]? Image_Data { get; set; }

        // date
    }
}
