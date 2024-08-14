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
                .Where(m => !m.Is_Ghosted) // Only check them atches that are not already ghosted
                .ToListAsync();

            foreach (var match in matches)
            {
                var lastMessage = await dbContext.ChatMessages
                    .Where(c => c.Match_Id == match.Id)
                    .OrderByDescending(c => c.Time_Stamp)
                    .FirstOrDefaultAsync();

                if (lastMessage != null && (DateTime.Now - lastMessage.Time_Stamp).TotalHours >= 24)
                {
                    match.Is_Ghosted = true;
                }
            }

            await dbContext.SaveChangesAsync();
        }
    }
}
