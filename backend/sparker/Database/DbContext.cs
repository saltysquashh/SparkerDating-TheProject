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
    }
}
