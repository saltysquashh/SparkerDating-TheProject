using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sparker.Migrations
{
    /// <inheritdoc />
    public partial class AddedEntityConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Swipes_Swiper_UserId_Swiped_UserId",
                table: "Swipes",
                columns: new[] { "Swiper_UserId", "Swiped_UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Preferences_User_Id",
                table: "Preferences",
                column: "User_Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Matches_User1_Id_User2_Id",
                table: "Matches",
                columns: new[] { "User1_Id", "User2_Id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Admins_User_Id",
                table: "Admins",
                column: "User_Id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Swipes_Swiper_UserId_Swiped_UserId",
                table: "Swipes");

            migrationBuilder.DropIndex(
                name: "IX_Preferences_User_Id",
                table: "Preferences");

            migrationBuilder.DropIndex(
                name: "IX_Matches_User1_Id_User2_Id",
                table: "Matches");

            migrationBuilder.DropIndex(
                name: "IX_Admins_User_Id",
                table: "Admins");
        }
    }
}
