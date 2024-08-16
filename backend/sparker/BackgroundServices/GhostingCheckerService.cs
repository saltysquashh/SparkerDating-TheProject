using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using sparker.Database;
using Microsoft.EntityFrameworkCore;

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
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken); // runs every hour
        }
    }

    private async Task CheckForGhostedMatches()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var matches = await dbContext.Matches
                .Where(m => !m.Is_Ghosted) // only check them atches that are not already ghosted
                .ToListAsync();

            foreach (var match in matches)
            {
                var lastMessage = await dbContext.ChatMessages
                    .Where(c => c.Match_Id == match.Id)
                    .OrderByDescending(c => c.Time_Stamp)
                    .FirstOrDefaultAsync();

                //reference time for ghosting:
                DateTime referenceTime;

                if (lastMessage != null)
                {
                    referenceTime = lastMessage.Time_Stamp;
                }
                else
                {
                    referenceTime = match.Matched_At;
                }

                // check if 24 hours have passed since the reference time
                if ((DateTime.Now - referenceTime).TotalHours >= 24)
                {
                    match.Is_Ghosted = true;
                }
            }

            await dbContext.SaveChangesAsync();
        }
    }
}
