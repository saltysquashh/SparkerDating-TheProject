using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sparker.Migrations
{
    /// <inheritdoc />
    public partial class AddIsGhostedToMatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Is_Ghosted",
                table: "Matches",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Is_Ghosted",
                table: "Matches");
        }
    }
}
