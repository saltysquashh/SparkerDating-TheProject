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
        public DbSet<Admin> Admins { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<ChatMessage>()
                .HasOne(m => m.Match)
                .WithMany()
                .HasForeignKey(m => m.Match_Id);

            modelBuilder.Entity<Match>()
                .HasIndex(m => new { m.User1_Id, m.User2_Id })
                .IsUnique();

            modelBuilder.Entity<Admin>()
                .HasIndex(a => a.User_Id)
                .IsUnique();
            modelBuilder.Entity<Swipe>()
                .HasIndex(s => new { s.Swiper_UserId, s.Swiped_UserId })
                .IsUnique();
            modelBuilder.Entity<Preference>()
                .HasIndex(p => p.User_Id)
                .IsUnique();
        }
    }
}
