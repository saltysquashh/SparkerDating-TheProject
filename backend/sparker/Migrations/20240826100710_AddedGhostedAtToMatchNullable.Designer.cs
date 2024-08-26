﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using sparker.Database;

#nullable disable

namespace sparker.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20240826100710_AddedGhostedAtToMatchNullable")]
    partial class AddedGhostedAtToMatchNullable
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("sparker.Models.Admin", b =>
                {
                    b.Property<int>("User_Id")
                        .HasColumnType("int");

                    b.Property<bool>("Is_Master")
                        .HasColumnType("bit");

                    b.HasKey("User_Id");

                    b.HasIndex("User_Id")
                        .IsUnique();

                    b.ToTable("Admins");
                });

            modelBuilder.Entity("sparker.Models.ChatMessage", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Content")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Match_Id")
                        .HasColumnType("int");

                    b.Property<int>("Receiver_Id")
                        .HasColumnType("int");

                    b.Property<int>("Sender_Id")
                        .HasColumnType("int");

                    b.Property<DateTime>("Time_Stamp")
                        .HasColumnType("datetime2");

                    b.HasKey("Id");

                    b.HasIndex("Match_Id");

                    b.ToTable("ChatMessages");
                });

            modelBuilder.Entity("sparker.Models.Image", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<byte[]>("Image_Data")
                        .HasColumnType("varbinary(max)");

                    b.Property<int>("User_Id")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("Images");
                });

            modelBuilder.Entity("sparker.Models.Match", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<DateTime?>("Ghosted_At")
                        .HasColumnType("datetime2");

                    b.Property<bool>("Is_Ghosted")
                        .HasColumnType("bit");

                    b.Property<DateTime>("Matched_At")
                        .HasColumnType("datetime2");

                    b.Property<int>("User1_Id")
                        .HasColumnType("int");

                    b.Property<int>("User2_Id")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("User1_Id", "User2_Id")
                        .IsUnique();

                    b.ToTable("Matches");
                });

            modelBuilder.Entity("sparker.Models.Preference", b =>
                {
                    b.Property<int>("User_Id")
                        .HasColumnType("int");

                    b.Property<int?>("Age_Max")
                        .HasColumnType("int");

                    b.Property<int?>("Age_Min")
                        .HasColumnType("int");

                    b.Property<string>("Sex")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("User_Id");

                    b.HasIndex("User_Id")
                        .IsUnique();

                    b.ToTable("Preferences");
                });

            modelBuilder.Entity("sparker.Models.Swipe", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<bool>("Liked")
                        .HasColumnType("bit");

                    b.Property<DateTime>("Swiped_At")
                        .HasColumnType("datetime2");

                    b.Property<int>("Swiped_UserId")
                        .HasColumnType("int");

                    b.Property<int>("Swiper_UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("Swiper_UserId", "Swiped_UserId")
                        .IsUnique();

                    b.ToTable("Swipes");
                });

            modelBuilder.Entity("sparker.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Bio")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("Birthdate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Email")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("First_Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Gender")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("Last_Login_At")
                        .HasColumnType("datetime2");

                    b.Property<string>("Last_Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Password_Hash")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("Registration_At")
                        .HasColumnType("datetime2");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("sparker.Models.Admin", b =>
                {
                    b.HasOne("sparker.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("User_Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("sparker.Models.ChatMessage", b =>
                {
                    b.HasOne("sparker.Models.Match", "Match")
                        .WithMany()
                        .HasForeignKey("Match_Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Match");
                });

            modelBuilder.Entity("sparker.Models.Preference", b =>
                {
                    b.HasOne("sparker.Models.User", "User")
                        .WithOne("Preference")
                        .HasForeignKey("sparker.Models.Preference", "User_Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("sparker.Models.User", b =>
                {
                    b.Navigation("Preference")
                        .IsRequired();
                });
#pragma warning restore 612, 618
        }
    }
}
