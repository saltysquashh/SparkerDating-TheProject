using Azure.Core;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using sparker.Database;
using sparker.DTOs;

using sparker.Models;
using sparker.Utilities;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Reflection.Emit;
using System.Security.Claims;
using System.Text;



[Authorize]
[ApiController]
[Route("[controller]")]

public class AuthenticationController : ControllerBase
{
    // DI
    private readonly ApplicationDbContext _context;
    private readonly PasswordHasher<User> _passwordHasher;
    private readonly IConfiguration _configuration;


    public AuthenticationController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = new PasswordHasher<User>(); // new instance of PasswordHasher

        _configuration = configuration;
    }

    // private så det ikke antages at være et http kald
    private string GenerateJwtToken(string userId)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        
        // Retrieve the jwt Secret
        var base64EncodedKey = Environment.GetEnvironmentVariable("JWT_SECRET");

        // decode the secret
        var key = Convert.FromBase64String(base64EncodedKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new Claim[]
            {
            new Claim(ClaimTypes.NameIdentifier, userId)
            }),
            Expires = DateTime.UtcNow.AddHours(1), // Token validity
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(CredentialLoginDTO credentialLoginDTO)
    {
        try
        {
            // Convert to lowercase
            var normalizedEmail = credentialLoginDTO.Email.ToLower();

            // Find the user by email
            var user = await _context.Users
                                     .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (user == null)
            {
                return Unauthorized("Invalid credentials");
            }

            // Verify the hashed password
            var result = _passwordHasher.VerifyHashedPassword(user, user.Password_Hash, credentialLoginDTO.Password);

            // error if the password is wrong
            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized("Invalid credentials");
            }

            if (result == PasswordVerificationResult.Success)
            {
                // Update the Last_Login_At field
                user.Last_Login_At = DateTime.Now;
                // Save changes to the db
                await _context.SaveChangesAsync();

                // Generate JWT token
                var token = GenerateJwtToken(user.Id.ToString());

                // check if user id is also registered in admin table
                var isAdmin = await PrivilegeUtils.IsUserAdmin(_context, user.Id); // the _context is included because the function is in another class
                var isMaster = await PrivilegeUtils.IsUserMasterAdmin(_context, user.Id);

                var authUserDTO = new AuthUserDTO // was "loginResponseDTO"
                {
                    Id = user.Id,
                    FirstName = user.First_Name,
                    LastName = user.Last_Name,
                    IsAdmin = isAdmin,
                    IsMaster = isMaster,
                    Token = token
                };
                return Ok(authUserDTO);
            }

            return BadRequest("An unknown error occurred during login.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred during login: {ex.Message}");
        }
    }

    [HttpGet("userinfobytoken")]
    public async Task<IActionResult> GetUserInfoByAuthToken()
    {
        try
        {
            // extract the user ID from the token, to then look up then be able to find the rest of the user information
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized("Invalid token");
        }
        var userId = int.Parse(userIdClaim.Value);

        var user = await _context.Users
                                 .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound("User not found");
        }

        // return the user information (excluding sensitive data like password hash)
        var userInfoDTO = new UserInfoDTO
        {
            Id = user.Id,
            FirstName = user.First_Name,
            LastName = user.Last_Name,
            IsAdmin = await PrivilegeUtils.IsUserAdmin(_context, user.Id),
            IsMaster = await PrivilegeUtils.IsUserMasterAdmin(_context, user.Id)
        };

        return Ok(userInfoDTO);
            } catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetched userinfo by auth token: {ex.Message}");
        }
    }
}