﻿namespace sparker.Controllers
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

        [Route("[controller]")]

        public class MessagesController : ControllerBase
        {
            // Dependency injection

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
                var messages = await _context.ChatMessages
                                        .Where(m => m.Match_Id == matchId)
                                        .OrderBy(m => m.Time_Stamp)
                                        .Select(m => new MessageDTO
                                        {
                                            MessageId = m.Id,
                                            SenderId = m.Sender_Id,
                                            Content = m.Content,
                                            Time_Stamp = m.Time_Stamp
                                        })
                                        .ToListAsync();

                return Ok(messages);
            }
        }
    }

}
