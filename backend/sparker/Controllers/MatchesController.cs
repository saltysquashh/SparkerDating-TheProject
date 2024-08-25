﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileSystemGlobbing;
using sparker.Database;
using sparker.DTOs;
using sparker.Models;
using System;

namespace sparker.Controllers
{
    [Authorize]
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

        // get a single match by its ID, and by the ID of the client-user it's fetched for
        [HttpGet("matchbyid/{matchId}/byuserid/{userId}")]
        public async Task<IActionResult> GetMatch(int matchId, int userId)
        {
            var match = await _context.Matches.FindAsync(matchId);

            if (match == null)
            {
                return NotFound($"Match with ID {matchId} not found.");
            }

            var matchUserId = match.User1_Id == userId ? match.User2_Id : match.User1_Id;
            var matchUser = await _context.Users.FindAsync(matchUserId);

            if (matchUser == null)
            {
                return NotFound($"User with ID {matchUserId} not found.");
            }

            // Fetch user images and convert to Base64 string
            var userImages = await _context.Images
                                .Where(i => i.User_Id == matchUserId)
                                .Select(i => Convert.ToBase64String(i.Image_Data))
                                .ToListAsync();

            var matchDTO = new MatchDTO
            {
                Id = match.Id,
                User1Id = match.User1_Id,
                User2Id = match.User2_Id,
                LastMessageUser1 = await DateUtils.LastUserMsg(_context, match.Id, match.User1_Id),
                LastMessageUser2 = await DateUtils.LastUserMsg(_context, match.Id, match.User2_Id),
                MatchedAt = match.Matched_At,
                IsGhosted = match.Is_Ghosted,

                MatchUser = new MatchUserDTO
                {
                    Id = matchUserId,
                    FullName = matchUser.First_Name + " " + matchUser.Last_Name,
                    Gender = matchUser.Gender,
                    Age = DateUtils.CalculateAge(matchUser.Birthdate),
                    Bio = matchUser.Bio,
                    Images = userImages
                }
            };

            return Ok(matchDTO);
        }

        // get ALL the matches the userid appears in
        [HttpGet("getallmatchesbyuserid/{userId}")]
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
                            .Select(g => new { UserId = g.Key, ImageData = g.FirstOrDefault().Image_Data })
                            .ToDictionaryAsync(g => g.UserId, g => Convert.ToBase64String(g.ImageData));

            var matchDTOs = new List<MatchDTO>();

            foreach (var match in matches)
            {
                var matchUserId = match.User1_Id == userId ? match.User2_Id : match.User1_Id;
                var matchUser = users[matchUserId];

                var matchDTO = new MatchDTO
                {
                    Id = match.Id,
                    User1Id = match.User1_Id,
                    User2Id = match.User2_Id,
                    LastMessageUser1 = await DateUtils.LastUserMsg(_context, match.Id, match.User1_Id),
                    LastMessageUser2 = await DateUtils.LastUserMsg(_context, match.Id, match.User2_Id),
                    MatchedAt = match.Matched_At,
                    IsGhosted = match.Is_Ghosted,
                    MatchUser = new MatchUserDTO
                    {
                        Id = matchUserId,
                        FullName = matchUser.First_Name + " " + matchUser.Last_Name,
                        Gender = matchUser.Gender,
                        Age = DateUtils.CalculateAge(matchUser.Birthdate),
                        Bio = matchUser.Bio,
                        Images = await _context.Images
                                    .Where(image => image.User_Id == matchUserId)
                                    .Select(image => Convert.ToBase64String(image.Image_Data))
                                    .ToListAsync()
                    }
                };

                matchDTOs.Add(matchDTO);
            }

            return Ok(matchDTOs);
        }


        // delete match
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

        [HttpPost("restore/{matchId}/{adminUserId}")]
        public async Task<IActionResult> RestoreMatch(int matchId, int adminUserId)
        {
            // Check if the user is an admin
            var isAdmin = await _context.Admins.AnyAsync(a => a.User_Id == adminUserId);
            if (!isAdmin)
            {
                return Unauthorized("You are not authorized to perform this action.");
            }

            var match = await _context.Matches.FindAsync(matchId);

            if (match == null)
            {
                return NotFound($"Match with ID {matchId} not found.");
            }

            if (!match.Is_Ghosted)
            {
                return BadRequest("This match is not ghosted.");
            }

            // restore the match by setting Is_Ghosted to false
            match.Is_Ghosted = false;

            await _context.SaveChangesAsync();

            return Ok("Match restored successfully.");
        }

    }
}



