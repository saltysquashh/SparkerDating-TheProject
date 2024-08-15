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

        // Return the timestamp. Its null if there are no messages
        return lastMessage?.Time_Stamp;
    }
}