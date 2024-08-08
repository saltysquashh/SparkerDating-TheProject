using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sparker.Database;
using sparker.DTOs;
using sparker.Models;
using System;

namespace sparker.Controllers
{
    [Route("[controller]")]
    public class MatchesController : ControllerBase
    {

        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public MatchesController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;

            _configuration = configuration;
        }

        [HttpGet("get/{userId}")]
        public async Task<IActionResult> GetMatches(int userId)
        {
            var matches = await _context.Matches
                .Where(m => m.User1_Id == userId || m.User2_Id == userId)
                .ToListAsync();

            var userIDs = matches.Select(m => m.User1_Id == userId ? m.User2_Id : m.User1_Id).Distinct().ToList();
            var users = await _context.Users.Where(u => userIDs.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u);

            // Fetch user images and convert to Base64 string
            var userImages = await _context.Images
                .Where(i => userIDs.Contains(i.User_Id))
                .GroupBy(i => i.User_Id)
                .Select(g => new { UserId = g.Key, ImageData = g.FirstOrDefault().Image_Data }) // Assuming there's an ImageData property
                .ToDictionaryAsync(g => g.UserId, g => Convert.ToBase64String(g.ImageData));

            var matchDtos = matches.Select(m =>
            {
                var matchedUserId = m.User1_Id == userId ? m.User2_Id : m.User1_Id;
                var matchedUser = users[matchedUserId];

                return new MatchDTO
                {
                    MatchId = m.Id,
                    MatchedAt = m.Matched_At,
                    MatchedUserId = matchedUserId,
                    MatchedName = matchedUser.First_Name + " " + matchedUser.Last_Name,
                    MatchedUserBio = matchedUser.Bio,
                    MatchedImageData = userImages.ContainsKey(matchedUserId) ? userImages[matchedUserId] : null // Set Base64 image data
                };
            });

            return Ok(matchDtos);
        }


        [HttpDelete("delete/{matchId}/{userId}")]
        public async Task<IActionResult> DeleteMatch(int matchId, int userId)
        {
            var match = await _context.Matches.FindAsync(matchId);
            if (match == null)
            {
                return NotFound("Match not found.");
            }

            // Check if the user is part of the match
            if (match.User1_Id != userId && match.User2_Id != userId)
            {
                return BadRequest("User is not part of this match.");
            }

            // Delete chat messages related to this match
            var chatMessages = _context.ChatMessages.Where(cm => cm.Match_Id == matchId);
            _context.ChatMessages.RemoveRange(chatMessages);

            // Delete the swipe where the user is the swiper
            var swipe = await _context.Swipes.FirstOrDefaultAsync(s =>
                (s.Swiper_UserId == userId && (s.Swiped_UserId == match.User1_Id || s.Swiped_UserId == match.User2_Id)));
            if (swipe != null)
            {
                _context.Swipes.Remove(swipe);
            }

            // Delete the match
            _context.Matches.Remove(match);

            await _context.SaveChangesAsync();

            return Ok("Match and related data deleted successfully.");
        }
    }


}



