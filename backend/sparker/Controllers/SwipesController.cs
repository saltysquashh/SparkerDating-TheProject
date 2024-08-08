using Azure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sparker.Database;
using sparker.DTOs;
using sparker.Models;
using System;

namespace sparker.Controllers
{

    [Route("[controller]")]
    public class SwipesController : ControllerBase
    {
        // dependency injection

        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public SwipesController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;

            _configuration = configuration;
        }

        [HttpPost("swipe")]
        public async Task<IActionResult> Swipe([FromBody] SwipeDTO swipeDto)
        {
            var swipe = new Swipe
            {
                Swiper_UserId = swipeDto.SwiperUserId,
                Swiped_UserId = swipeDto.SwipedUserId,
                Liked = swipeDto.Liked,
                Swiped_At = DateTime.Now
            };

            _context.Swipes.Add(swipe);
            await _context.SaveChangesAsync();

            bool isMatch = false;

            // Check for match
            var potentialMatch = await _context.Swipes.FirstOrDefaultAsync(s =>
                s.Swiped_UserId == swipe.Swiper_UserId &&
                s.Swiper_UserId == swipe.Swiped_UserId &&
                s.Liked);

            if (potentialMatch != null)
            {
                isMatch = true;
                // Create match
                var match = new Match
                {
                    User1_Id = swipe.Swiper_UserId,
                    User2_Id = swipe.Swiped_UserId,
                    Matched_At = DateTime.Now
                };

                _context.Matches.Add(match);
                await _context.SaveChangesAsync();
            }

            // Get next user based on preferences
            //NextUserDTO nextUser = GetNextSwipeUser(1);

            // Use the extracted method to get the next user
            //var nextUser = await FetchNextUser(swipeDto.SwiperUserId);

            //var response = new SwipeResponseDTO
            //{
            //    IsMatch = potentialMatch != null,
            //    // NextUser = nextUser
            //};

            return Ok(isMatch);
        }


        [HttpGet("nextswipeuser/{userId}")]
        public async Task<IActionResult> GetNextSwipeUser(int userId)
        {

            var nextUser = await FetchNextUser(userId);
            if (nextUser == null)
            {
                return NotFound("No suitable matches found.");
            }
            return Ok(nextUser); // Return the DTO instead of the full User entity
        }

        private int CalculateAge(DateTime birthdate)
        {
            var today = DateTime.Today;
            var age = today.Year - birthdate.Year;
            if (birthdate.Date > today.AddYears(-age)) age--;
            return age;
        }




        private async Task<NextUserDTO> FetchNextUser(int userId)
        {
            var userPreferences = await _context.Preferences
                                                .FirstOrDefaultAsync(p => p.User_Id == userId);
            if (userPreferences == null)
            {
                //return NotFound("User preferences not found. Check if user has preferences selected on their user profile.");
            }

            // Retrieve users who have not been swiped by the swiping user and who have not disliked the swiping user, and are not the swiping user themselves
            var potentialMatches = await _context.Users
                .Where(u => u.Id != userId && // Exclude the current user
                           !_context.Swipes.Any(s => (s.Swiper_UserId == userId && s.Swiped_UserId == u.Id) ||
                                                     (s.Swiper_UserId == u.Id && s.Swiped_UserId == userId && !s.Liked)))
                .Include(u => u.Preference) // Ensure to load preferences for potential matches
                .ToListAsync();


            // Filter users based on swiping user's preferences (gender and age)
            potentialMatches = potentialMatches.Where(u =>
                (userPreferences.Sex == null || u.Gender == userPreferences.Sex) &&
                (userPreferences.Age_Min == null || CalculateAge(u.Birthdate) >= userPreferences.Age_Min) &&
                (userPreferences.Age_Max == null || CalculateAge(u.Birthdate) <= userPreferences.Age_Max)
            ).ToList();

            // Further filter based on whether the potential match's preferences fit the swiper's user-info
            var swiperUserInfo = _context.Users.FirstOrDefault(x => x.Id == userId);
            var swiperAge = CalculateAge(swiperUserInfo.Birthdate);
            var finalMatches = potentialMatches.Where(u =>
                (u.Preference != null) &&
                (u.Preference.Sex == null || u.Preference.Sex == _context.Users.FirstOrDefault(x => x.Id == userId).Gender) &&
                (u.Preference.Age_Min == null || CalculateAge(_context.Users.FirstOrDefault(x => x.Id == userId).Birthdate) >= u.Preference.Age_Min) &&
                (u.Preference.Age_Max == null || CalculateAge(_context.Users.FirstOrDefault(x => x.Id == userId).Birthdate) <= u.Preference.Age_Max)
            ).ToList();


            var nextUserDto = finalMatches.Select(u => new NextUserDTO
            {
                Id = u.Id,
                Name = u.First_Name + " " + u.Last_Name,
                Age = CalculateAge(u.Birthdate),
                Gender = u.Gender,
                Bio = u.Bio,
                // Map other properties as needed
            }).FirstOrDefault();


            return(nextUserDto);
        }
    }

}
