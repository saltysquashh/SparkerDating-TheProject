using Azure.Core;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using sparker.Database;
using sparker.DTOs;
using sparker.DTOs.sparker.DTOs;
using sparker.Migrations;
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

public class AuthorizationController : ControllerBase
{
    // DI
    private readonly ApplicationDbContext _context;
    private readonly PasswordHasher<User> _passwordHasher;
    private readonly IConfiguration _configuration;


    public AuthorizationController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = new PasswordHasher<User>(); // new instance of PasswordHasher

        _configuration = configuration;
    }

    // move to AuthUtils?
    // private så det ikke antages at være et http kald
    private string GenerateJwtToken(string userId)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var base64EncodedKey = _configuration["JwtConfig:Secret"];
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
        // Convert to lower
        var normalizedEmail = credentialLoginDTO.Email.ToLower();

        // Find the user by email
        var user = await _context.Users
                                 .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null)
        {
            return Unauthorized("Invalid credentials");
        }

        // Verify the password
        var result = _passwordHasher.VerifyHashedPassword(user, user.Password_Hash, credentialLoginDTO.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Invalid credentials");
        }

        if (result == PasswordVerificationResult.Success)
        {
            // Generate JWT token
            var token = GenerateJwtToken(user.Id.ToString());

            // check if user id is also registered in admin table
            var isAdmin = await PrivilegeUtils.IsUserAdmin(_context, user.Id); // the _context is included because the function is in another class
            var isMaster = await PrivilegeUtils.IsUserMasterAdmin(_context, user.Id);

            var loginResponseDTO = new LoginResponseDTO
            {
                Id = user.Id,
                FirstName = user.First_Name,
                LastName = user.Last_Name,
                IsAdmin = isAdmin,
                IsMaster = isMaster,
                Token = token
            };

            return Ok(loginResponseDTO);
        }

        return BadRequest("An unknown error occurred.");
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUserFromToken()
    {
        // Extract the user ID from the token
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
        var userResponse = new
        {
            user.Id,
            user.First_Name,
            user.Last_Name,
            IsAdmin = await PrivilegeUtils.IsUserAdmin(_context, user.Id),
            IsMaster = await PrivilegeUtils.IsUserMasterAdmin(_context, user.Id)
        };

        return Ok(userResponse);
    }
}