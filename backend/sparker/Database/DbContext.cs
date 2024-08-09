using Microsoft.EntityFrameworkCore;
using sparker.Models;
using System.Collections.Generic;

namespace sparker.Database
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Preference> Preferences { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<Swipe> Swipes { get; set; }
        public DbSet<Match> Matches { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<ChatMessage>()
                .HasOne(m => m.Match)
                .WithMany()
                .HasForeignKey(m => m.Match_Id);
        }



    }
}
