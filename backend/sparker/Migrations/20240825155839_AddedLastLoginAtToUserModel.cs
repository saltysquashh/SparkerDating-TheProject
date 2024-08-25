using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sparker.Migrations
{
    /// <inheritdoc />
    public partial class AddedLastLoginAtToUserModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Last_Login_At",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Last_Login_At",
                table: "Users");
        }
    }
}
