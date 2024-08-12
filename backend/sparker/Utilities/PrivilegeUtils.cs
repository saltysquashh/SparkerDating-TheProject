namespace sparker.Utilities
{
    using Microsoft.EntityFrameworkCore;
    using sparker.Database;
    using System.Threading.Tasks;

    public static class PrivilegeUtils
    {
        // The DB context is included as an agrgument
        public static async Task<bool> IsUserAdmin(ApplicationDbContext context, int userId)
        {
            return await context.Admins.AnyAsync(a => a.User_Id == userId);
        }

        // The DB context is included as an agrgument
        public static async Task<bool> IsUserMasterAdmin(ApplicationDbContext context, int userId)
        {
            return await context.Admins
                .AnyAsync(a => a.User_Id == userId && a.Is_Master);
        }
    }
}