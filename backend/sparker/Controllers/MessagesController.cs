namespace sparker.Controllers
{
    using global::sparker.Database;
    using global::sparker.DTOs;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.IdentityModel.Tokens;

    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;

    namespace sparker.Controllers
    {
        [Authorize]
        [Route("[controller]")]

        public class MessagesController : ControllerBase
        {

            private readonly ApplicationDbContext _context;
            private readonly IConfiguration _configuration;

            public MessagesController(ApplicationDbContext context, IConfiguration configuration)
            {
                _context = context;

                _configuration = configuration;
            }


            [HttpGet("getMatchMessages/{matchId}")]
            public async Task<IActionResult> GetMessagesForMatch(int matchId)
            {
                try
                {
                    // check if a match with the provided matchId exists
                    var matchExists = await _context.Matches.AnyAsync(m => m.Id == matchId);
                    if (!matchExists)
                    {
                        return NotFound($"Match with ID {matchId} not found.");
                    }

                    // retrieve messages for the specified matchId, ordered by timestamp
                    var messages = await _context.ChatMessages
                        .Where(m => m.Match_Id == matchId)
                        .OrderBy(m => m.Time_Stamp)
                        .Select(m => new MessageDTO
                        {
                            MessageId = m.Id,
                            SenderId = m.Sender_Id,
                            Content = m.Content,
                            TimeStamp = m.Time_Stamp,
                            SenderName = _context.Users
                                .Where(u => u.Id == m.Sender_Id)
                                .Select(u => $"{u.First_Name} {u.Last_Name}") // subquery to get sender's first and last name
                                .FirstOrDefault()
                        })
                        .ToListAsync();

                    // Return the messages in the response
                    return Ok(messages);
                }
                catch (Exception ex)
                {
                    // Return a generic error
                    return StatusCode(500, $"An error occurred while retrieving messages: {ex.Message}");
                }
            }
        }
    }
}
