using sparker.Models;

namespace sparker.DTOs
{
    public class SwipeDetailsDTO
    {
        // the details of the user that was swiped

        public ShowcaseUserDTO ShowcaseUserDTO { get; set; }
        public Swipe Swipe { get; set; } // the details of the swipe
        public Match Match { get; set; } // the match (if it exists)
    }
}
