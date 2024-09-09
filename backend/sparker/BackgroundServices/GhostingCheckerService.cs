using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using sparker.Database;
using Microsoft.EntityFrameworkCore;
using sparker.Models;
using Newtonsoft.Json.Linq;
using NuGet.Packaging.Signing;

public class GhostingCheckerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public GhostingCheckerService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await CheckForGhostedMatches();
            await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
        }
    }

    private async Task CheckForGhostedMatches()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var _context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // filter by all matches that aren't ghosted
            var matches = await _context.Matches
                .Where(m => !m.Is_Ghosted)
                .ToListAsync();

            // loop through the found matches
            foreach (var match in matches)
            {
                var lastMessageUser1 = await _context.ChatMessages.Where(chatmsg =>
                            (chatmsg.Match_Id == match.Id) &&
                            (chatmsg.Sender_Id == match.User1_Id))
                            .OrderByDescending(c => c.Time_Stamp)
                            .FirstOrDefaultAsync();

                var lastMessageUser2 = await _context.ChatMessages.Where(chatmsg =>
                           (chatmsg.Match_Id == match.Id) &&
                           (chatmsg.Sender_Id == match.User2_Id))
                           .OrderByDescending(c => c.Time_Stamp)
                           .FirstOrDefaultAsync();

                // (determine if the user ever sent a message or the match date should be used)
                // If lastMessageUser1?.Time_Stamp is null then match.Matched_At is used as the value
                DateTime? referenceTimeUser1 = lastMessageUser1?.Time_Stamp ?? match.Matched_At;
                DateTime? referenceTimeUser2 = lastMessageUser2?.Time_Stamp ?? match.Matched_At;

                int? ghostedByUserId = null;

                bool user1Ghosted = (DateTime.Now - referenceTimeUser1.Value).TotalHours >= 24;
                bool user2Ghosted = (DateTime.Now - referenceTimeUser2.Value).TotalHours >= 24;

                if (user1Ghosted && user2Ghosted)
                {
                    // both users haven't sent a message in the last 24 hours
                    ghostedByUserId = referenceTimeUser1 <= referenceTimeUser2 ? match.User1_Id : match.User2_Id;
                }
                else if (user1Ghosted)
                {
                    // User 1 ghosted
                    ghostedByUserId = match.User1_Id;
                }
                else if (user2Ghosted)
                {
                    // User 2 ghosted
                    ghostedByUserId = match.User2_Id;
                }

                if (ghostedByUserId.HasValue)
                {
                    // set match to ghosted
                    match.Is_Ghosted = true;

                    // create new Ghost entity
                    var newGhost = new Ghost
                    {
                        Match_Id = match.Id,
                        Ghosted_At = DateTime.Now, // time of ghosting
                        Ghosted_By = ghostedByUserId.Value // the user who ghosted
                    };

                    var ghost = await _context.Ghosts
                            .Where(g => g.Match_Id == match.Id)
                            .FirstOrDefaultAsync();

                    if (ghost == null)
                    {
                        _context.Ghosts.Add(newGhost);
                    }
                    else 
                    {
                        ghost = newGhost;
                        _context.Ghosts.Update(newGhost);
                    }
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
