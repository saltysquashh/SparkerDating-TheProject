using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sparker.Migrations
{
    /// <inheritdoc />
    public partial class ForeignKeyAndNavigationProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create the Ghosts table with Match_Id as the primary key and foreign key
            migrationBuilder.CreateTable(
                name: "Ghosts",
                columns: table => new
                {
                    Match_Id = table.Column<int>(type: "int", nullable: false),
                    Ghosted_At = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ghosted_By = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ghosts", x => x.Match_Id);
                    table.ForeignKey(
                        name: "FK_Ghosts_Matches_Match_Id",
                        column: x => x.Match_Id,
                        principalTable: "Matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ghosts");
        }
    }
}
