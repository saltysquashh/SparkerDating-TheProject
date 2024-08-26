using Azure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sparker.Database;
using sparker.DTOs;
using sparker.Models;
using System;

namespace sparker.Controllers
{
    [Authorize]
    [Route("[controller]")]
    public class SwipesController : ControllerBase
    {

        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public SwipesController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;

            _configuration = configuration;
        }

        [HttpPost("swipe")]
        public async Task<IActionResult> CreateSwipe([FromBody] PerformSwipeDTO performSwipeDTO)
        {
            var swipe = new Swipe
            {
                Swiper_UserId = performSwipeDTO.SwiperUserId,
                Swiped_UserId = performSwipeDTO.SwipedUserId,
                Liked = performSwipeDTO.Liked,
                Swiped_At = DateTime.Now
            };

            _context.Swipes.Add(swipe);
            await _context.SaveChangesAsync();

            if (!performSwipeDTO.Liked)
            {
                return Ok(new SwipeActionResponseDTO
                {
                    IsMatch = false,
                    Message = "You passed on this user."
                });
            }

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

            return Ok(new SwipeActionResponseDTO
            {
                IsMatch = isMatch,
                Message = "You have a new match!"
            });
        }


        [HttpGet("getswipesbyuser/{userId}")]
        public async Task<IActionResult> GetAllSwipesByUser(int userId)
        {
            var swipes = await _context.Swipes
                .Where(s => s.Swiper_UserId == userId)
                .ToListAsync();

            var userIDs = swipes.Select(s => s.Swiper_UserId == userId ? s.Swiped_UserId : s.Swiper_UserId).Distinct().ToList();
            var users = await _context.Users.Where(u => userIDs.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u);

            // Fetch user images and convert to Base64 string
            var userImages = await _context.Images
                .Where(i => userIDs.Contains(i.User_Id))
                .GroupBy(i => i.User_Id)
                .Select(g => new { UserId = g.Key, ImageData = g.FirstOrDefault().Image_Data }) // Assuming there's an ImageData property
                .ToDictionaryAsync(g => g.UserId, g => Convert.ToBase64String(g.ImageData));

            var swipeHistoryDTOs = new List<SwipeHistoryDTO>();

            foreach (var swipe in swipes)
            {
                var swipedUserId = swipe.Swiper_UserId == userId ? swipe.Swiped_UserId : swipe.Swiper_UserId;
                var swipedUser = users[swipedUserId];

                var swipeHistoryDTO = new SwipeHistoryDTO
                {
                    Id = swipe.Id,
                    SwipedAt = swipe.Swiped_At,
                    SwipedUserId = swipe.Swiped_UserId,
                    SwipedName = swipedUser.First_Name + " " + swipedUser.Last_Name,
                    SwipedBio = swipedUser.Bio,
                    SwipedImageData = userImages.ContainsKey(swipedUserId) ? userImages[swipedUserId] : null, // Set Base64 image data
                    SwipedAge = DateUtils.CalculateAge(swipedUser.Birthdate),
                    SwipedGender = swipedUser.Gender,
                    Liked = swipe.Liked,
                    IsMatch = await CheckIfUsersMatched(swipe.Swiper_UserId, swipe.Swiped_UserId)
                };

                swipeHistoryDTOs.Add(swipeHistoryDTO);
            }

            return Ok(swipeHistoryDTOs);
        }

        private async Task<bool> CheckIfUsersMatched(int userId1, int userId2)
        {
            return await _context.Matches.AnyAsync(m =>
                (m.User1_Id == userId1 && m.User2_Id == userId2) ||
                (m.User1_Id == userId2 && m.User2_Id == userId1));
        }



        [HttpGet("swipedetails/{swipedId}/{swiperId}")]
        public async Task<IActionResult> GetSwipeDetailsByUsers(int swipedId, int swiperId)
        {
            var user = await _context.Users.FindAsync(swipedId);
            if (user == null)
            {
                return NotFound($"User with ID {swipedId} not found.");
            }

            // Find the swipe information between the two users
            var swipe = await _context.Swipes
                .FirstOrDefaultAsync(s => s.Swiper_UserId == swiperId && s.Swiped_UserId == swipedId);

            if (swipe == null)
            {
                return NotFound("Swipe data not found.");
            }

            // Find if there is a match between the two users
            var match = await _context.Matches
                .FirstOrDefaultAsync(m =>
                    (m.User1_Id == swiperId && m.User2_Id == swipedId) ||
                    (m.User1_Id == swipedId && m.User2_Id == swiperId));

            // Build SwipeUser child
            var swipeUserDTO = new SwipeUserDTO
            {
                Id = user.Id,
                FirstName = user.First_Name,
                LastName = user.Last_Name,
                Gender = user.Gender,
                Age = DateUtils.CalculateAge(user.Birthdate),
                Bio = user.Bio,
                Images = _context.Images
                        .Where(i => i.User_Id == user.Id)
                        .Select(i => Convert.ToBase64String(i.Image_Data))
                        .ToList(),
            };

            // Build the DTO
            var swipeDetailsDTO = new SwipeDetailsDTO
            {
                SwipeUser = swipeUserDTO, // include child DTO built before, which includes the user data
                Swipe = swipe,
                Match = match // empty if it doesn't exist
            };

            return Ok(swipeDetailsDTO);
        }


        [HttpDelete("delete/{swipeId}")]
        public async Task<IActionResult> DeleteMatch(int swipeId)
        {
            // find the swipe directly by its Id
            var swipe = await _context.Swipes.FindAsync(swipeId);
            if (swipe == null)
            {
                return NotFound("Swipe not found.");
            }

            // delete swipe
            _context.Swipes.Remove(swipe);

            await _context.SaveChangesAsync();

            return Ok("Swipe deleted successfully.");
        }
    }

}
