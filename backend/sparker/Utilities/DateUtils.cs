// DateUtils.cs
using Microsoft.EntityFrameworkCore;
using sparker.Database;
using System;
public static class DateUtils
{
    public static int CalculateAge(DateTime birthdate)
    {
        var today = DateTime.Today;
        var age = today.Year - birthdate.Year;
        if (birthdate.Date > today.AddYears(-age)) age--;
        return age;
    }

    public static async Task<DateTime?> LastUserMsg(ApplicationDbContext context, int matchId, int userId)
    {
        var lastMessage = await context.ChatMessages
            .Where(m => m.Sender_Id == userId && m.Match_Id == matchId)
            .OrderByDescending(m => m.Time_Stamp)
            .FirstOrDefaultAsync();

        // If a message is found, return its timestamp
        if (lastMessage != null)
        {
            return lastMessage.Time_Stamp;
        }

        // If no message is found, return the stamp of when the match was screated instead, as the ref point
        var matchedAt = await context.Matches
            .Where(m => m.Id == matchId)
            .Select(m => m.Matched_At)
            .FirstOrDefaultAsync();

        return matchedAt;
    }
}