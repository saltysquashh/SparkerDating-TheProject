using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sparker.Migrations
{
    /// <inheritdoc />
    public partial class User_IsMaster : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Is_Master",
                table: "Admins",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Is_Master",
                table: "Admins");
        }
    }
}
