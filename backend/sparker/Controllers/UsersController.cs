using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using sparker.Database;
using sparker.DTOs;
using sparker.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;




[ApiController]

[Route("[controller]")]

public class UsersController : ControllerBase
{
    // Inject services if needed

    private readonly ApplicationDbContext _context;
    private readonly PasswordHasher<User> _passwordHasher;
    private readonly IConfiguration _configuration;


    public UsersController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = new PasswordHasher<User>();

        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {


        var user = new User
        {
            First_Name = registerDto.FirstName,
            Last_Name = registerDto.LastName,
            Email = registerDto.Email,
            Gender = registerDto.Gender,
            Birthdate = registerDto.Birthdate,
        };

        user.Password_Hash = _passwordHasher.HashPassword(user, registerDto.Password);


        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { userId = user.Id }); // or other relevant data
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(CredentialLoginDTO credentialLoginDTO)
    {
        // Find the user by email
        var user = await _context.Users
                                 .FirstOrDefaultAsync(u => u.Email == credentialLoginDTO.Email);

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

            var userResponse = new UserResponseDTO
            {
                Id = user.Id,
                FirstName = user.First_Name,
                LastName = user.Last_Name,
                Token = token // Include the token in the response
            };

            return Ok(userResponse);
        }

        return BadRequest("An unknown error occurred.");
    }


    [HttpGet("userinfo/{id}")]
    public async Task<IActionResult> GetUserInfo(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound($"User with ID {id} not found.");
        }

        var userInfoDTO = new UserInfoDTO
        {
            Id = user.Id,
            FirstName = user.First_Name,
            LastName = user.Last_Name,
            Email = user.Email,
            Gender = user.Gender,
            Birthdate = user.Birthdate,
            Bio = user.Bio,
        };

        return Ok(userInfoDTO);
    }




[HttpPut("userinfo/{id}")]
    // [Authorize]
    public async Task<IActionResult> UpdateUserInfo(int id, [FromBody] UpdateUserInfoDTO updateUserInfoDTO)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound($"User with ID {id} not found.");
        }

        // Update user properties
        user.First_Name = updateUserInfoDTO.FirstName;
        user.Last_Name = updateUserInfoDTO.LastName;
        user.Email = updateUserInfoDTO.Email;
        user.Gender = updateUserInfoDTO.Gender;
        user.Birthdate = updateUserInfoDTO.Birthdate;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(user); // or NoContent() to return nothing
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }
    }

    [HttpGet("userbio/{id}")]
    public async Task<IActionResult> GetUserBio(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound($"User with ID {id} not found.");
        }

        var userBio = new UserBioDTO
        {
            Bio = user.Bio,
        };

        return Ok(userBio);
    }


    [HttpPut("userbio/{id}")]
    // [Authorize]
    public async Task<IActionResult> UpdateUserBio(int id, [FromBody] UserBioDTO userBioDTO)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound($"User with ID {id} not found.");
        }

        // Update user properties
        user.Bio = userBioDTO.Bio;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(user); // or NoContent() to return nothing
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }
    }




    // private så Swagger ikke antager at det skal være et http kald og fejler
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
            Expires = DateTime.UtcNow.AddDays(7), // Token validity
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }


    private bool UserExists(int id)
    {
        return _context.Users.Any(e => e.Id == id);
    }





}
