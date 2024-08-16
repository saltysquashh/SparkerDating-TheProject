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
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;



[Authorize]
[ApiController]
[Route("[controller]")]

public class UsersController : ControllerBase
{
    // DI
    private readonly ApplicationDbContext _context;
    private readonly PasswordHasher<User> _passwordHasher;
    private readonly IConfiguration _configuration;


    public UsersController(ApplicationDbContext context, IConfiguration configuration)
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
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        // validate the input and check if the user already exists ?

        var user = new User
        {
            First_Name = registerDto.FirstName,
            Last_Name = registerDto.LastName,
            Email = registerDto.Email.ToLower(),
            Gender = registerDto.Gender,
            Birthdate = registerDto.Birthdate,
            Registration_At = DateTime.Now
        };

        user.Password_Hash = _passwordHasher.HashPassword(user, registerDto.Password);


        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // create default preferences for the new user
        var defaultPreference = new Preference
        {
            User_Id = user.Id,
            Sex = "Both",
            Age_Min = 18,
            Age_Max = 99 
        };

        _context.Preferences.Add(defaultPreference);
        await _context.SaveChangesAsync();

        return Ok(new { userId = user.Id });
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
                IsAdmin = isAdmin, // IsAdmin is included in the login response so it can be added to the authcontext on login
                IsMaster = isMaster,
                Token = token // Include the token in the response
            };

            return Ok(loginResponseDTO);
        }

        return BadRequest("An unknown error occurred.");
    }

    [HttpGet("isadmin/{userId}")]
    public async Task<IActionResult> IsAdmin(int userId)
    {
        var isAdmin = await PrivilegeUtils.IsUserAdmin(_context, userId); // the _context is included because the function is in another class
        return Ok(isAdmin);
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

    [HttpGet("showcaseuser/{id}")]
    public async Task<IActionResult> GetShowcaseUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound($"User with ID {id} not found.");
        }

        var showcaseUserDTO = new ShowcaseUserDTO
        {
            Id = user.Id,
            FirstName = user.First_Name,
            LastName = user.Last_Name,
            Gender = user.Gender,
            Age = DateUtils.CalculateAge(user.Birthdate),
            Bio = user.Bio,
            Images = _context.Images
                    .Where(i => i.User_Id == user.Id)
                    .Select(i => Convert.ToBase64String(i.Image_Data)) // Convet image data to base 64
                    .ToList()
        };

        return Ok(showcaseUserDTO);
    }


    [HttpPut("userinfo/{id}")]
    [Authorize]
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
            return Ok(user); // NoContent() will return nothing
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

    [HttpGet("usercustomization/{id}")]
    public async Task<IActionResult> GetUserCustomization(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound($"User with ID {id} not found.");
        }

        var userCustomizationDTO = new UserCustomizationDTO
        {
            Bio = user.Bio,
            // do i want more properties in "Customization"?
        };

        return Ok(userCustomizationDTO);
    }


    [HttpPut("userbio/{id}/{newBio}")]
    // [Authorize]
    public async Task<IActionResult> UpdateUserBio(int id, string newBio)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound($"User with ID {id} not found.");
        }

        if (user.Bio == newBio)
        {
            // return user bio is the same as before
            return Ok(false);
        }
 
        user.Bio = newBio;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(true); // or NoContent() to return nothing
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

    [HttpGet("useremailexists/{email}")]
    public async Task<IActionResult> CheckUserEmailExists(string email)
    {
        bool exists = true;

        var user = await _context.Users
                         .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            exists = false;
        }

        return Ok(exists);
    }

    private bool UserExists(int id)
    {
        return _context.Users.Any(e => e.Id == id);
    }

    [HttpGet("nextswipeuser/{userId}")]
    public async Task<IActionResult> GetNextSwipeUser(int userId)
    {

        var nextUser = await FetchNextUser(userId);
        if (nextUser == null)
        {
            return NotFound("No suitable matches found.");
        }
        return Ok(nextUser); // Return the DTO instead of the full User entity
    }

    private async Task<NextUserDTO> FetchNextUser(int userId)
    {
        var userPreferences = await _context.Preferences
                                            .FirstOrDefaultAsync(p => p.User_Id == userId);
        if (userPreferences == null)
        {
            //return NotFound("User preferences not found. Check if user has preferences selected on their user profile.");
        }

        // Retrieve users who have not been swiped by the swiping user and who have not disliked the swiping user, and are not the swiping user themselves
        var potentialMatches = await _context.Users
            .Where(u => u.Id != userId && // Exclude the current user
                       !_context.Swipes.Any(s => (s.Swiper_UserId == userId && s.Swiped_UserId == u.Id) ||
                                                 (s.Swiper_UserId == u.Id && s.Swiped_UserId == userId && !s.Liked)))
            .Include(u => u.Preference) // Ensure to load preferences for potential matches
            .ToListAsync();


        // Filter users based on swiping user's preferences (gender and age)
        potentialMatches = potentialMatches.Where(u =>
            (userPreferences.Sex == null || userPreferences.Sex == "Both" || u.Gender == userPreferences.Sex) &&
            (userPreferences.Age_Min == null || DateUtils.CalculateAge(u.Birthdate) >= userPreferences.Age_Min) &&
            (userPreferences.Age_Max == null || DateUtils.CalculateAge(u.Birthdate) <= userPreferences.Age_Max)
        ).ToList();

        // Further filter based on whether the potential match's preferences fit the swiper's user-info
        var swiperUserInfo = _context.Users.FirstOrDefault(x => x.Id == userId);
        var swiperAge = DateUtils.CalculateAge(swiperUserInfo.Birthdate);
        var finalMatches = potentialMatches.Where(u =>
            (u.Preference != null) &&
            (u.Preference.Sex == null || u.Preference.Sex == "Both" || u.Preference.Sex == swiperUserInfo.Gender) &&
            (u.Preference.Age_Min == null || DateUtils.CalculateAge(_context.Users.FirstOrDefault(x => x.Id == userId).Birthdate) >= u.Preference.Age_Min) &&
            (u.Preference.Age_Max == null || DateUtils.CalculateAge(_context.Users.FirstOrDefault(x => x.Id == userId).Birthdate) <= u.Preference.Age_Max)
        ).ToList();


        var nextUserDto = finalMatches.Select(u => new NextUserDTO
        {
            Id = u.Id,
            Name = u.First_Name + " " + u.Last_Name,
            Age = DateUtils.CalculateAge(u.Birthdate),
            Gender = u.Gender,
            Bio = u.Bio,
            Images = _context.Images
                    .Where(i => i.User_Id == u.Id)
                    .Select(i => Convert.ToBase64String(i.Image_Data)) // Convert image data to base64
                    .ToList() // Fetch the list of images for this user

        }).FirstOrDefault();

        return (nextUserDto);
    }
    [HttpDelete("delete/{delUserId}/{byUserId}")]
    public async Task<IActionResult> DeleteUser(int delUserId, int byUserId) // Didnt have enough time to look into deletion Cascades
    {
        var delUser = await _context.Users.FindAsync(delUserId);
        if (delUser == null)
        {
            return NotFound("User to be deleted not found.");
        }

        var byUser = await _context.Users.FindAsync(byUserId);
        if (byUser == null)
        {
            return NotFound("The user performing the deletion was not found.");
        }

        // Check if the user being deleted is an admin
        var isDelUserAdmin = await _context.Admins.AnyAsync(a => a.User_Id == delUserId);

        if (isDelUserAdmin)
        {
            // Check if the user performing the deletion is a master admin
            var isByUserMasterAdmin = await _context.Admins
                .Where(a => a.User_Id == byUserId)
                .Select(a => a.Is_Master)
                .FirstOrDefaultAsync();

            // If the user performing the deletion is not a master admin, deny the operation
            if (!isByUserMasterAdmin)
            {
                return Unauthorized("Only a master admin can delete another admin.");
            }
        }

        // Delete related matches and chat messages
        var matches = await _context.Matches
            .Where(m => m.User1_Id == delUserId || m.User2_Id == delUserId)
            .ToListAsync();

        foreach (var match in matches)
        {
            var chatMessages = await _context.ChatMessages
                .Where(cm => cm.Match_Id == match.Id)
                .ToListAsync();

            _context.ChatMessages.RemoveRange(chatMessages);
        }

        _context.Matches.RemoveRange(matches);

        // Delete related swipes
        var swipes = await _context.Swipes
            .Where(s => s.Swiper_UserId == delUserId || s.Swiped_UserId == delUserId)
            .ToListAsync();

        _context.Swipes.RemoveRange(swipes);

        // Delete related preferences
        var preference = await _context.Preferences
            .Where(p => p.User_Id == delUserId)
            .FirstOrDefaultAsync();

        if (preference != null)
        {
            _context.Preferences.Remove(preference);
        }

        // Delete related images
        var images = await _context.Images
            .Where(i => i.User_Id == delUserId)
            .ToListAsync();

        _context.Images.RemoveRange(images);

        // Delete related admin record if it exists
        var adminRecord = await _context.Admins
            .Where(a => a.User_Id == delUserId)
            .FirstOrDefaultAsync();

        if (adminRecord != null)
        {
            _context.Admins.Remove(adminRecord);
        }

        // Delete user
        _context.Users.Remove(delUser);
        await _context.SaveChangesAsync();

        return Ok("User and related data deleted successfully.");
    }

    [HttpPost("promote/{userId}/{byUserId}")]
    public async Task<IActionResult> PromoteUserToAdmin(int userId, int byUserId)
    {
        // Find the user to be promoted by their ID
        var userToPromote = await _context.Users.FindAsync(userId);
        if (userToPromote == null)
        {
            return NotFound("User to be promoted not found.");
        }

        // Find the user performing the promotion by their ID
        var byUser = await _context.Users.FindAsync(byUserId);
        if (byUser == null)
        {
            return NotFound("The user performing the promotion was not found.");
        }

        // Check if the user performing the promotion is a master admin
        var isByUserMasterAdmin = await _context.Admins
            .Where(a => a.User_Id == byUserId)
            .Select(a => a.Is_Master)
            .FirstOrDefaultAsync();

        if (!isByUserMasterAdmin)
        {
            return Unauthorized("Only a master admin can promote another user to admin.");
        }

        // Promote the user to admin
        var newAdmin = new Admin
        {
            User_Id = userToPromote.Id,
            Is_Master = false // Default to false when promoting to a regular admin
        };

        _context.Admins.Add(newAdmin);
        await _context.SaveChangesAsync();

        return Ok("User promoted to admin successfully.");
    }

    [HttpPost("demote/{adminUserId}/{byUserId}")]
    public async Task<IActionResult> DemoteAdminToUser(int adminUserId, int byUserId)
    {
        // Find the admin to be demoted by their ID
        var adminUserToDemote = await _context.Admins.FirstOrDefaultAsync(a => a.User_Id == adminUserId);
        if (adminUserToDemote == null)
        {
            return NotFound("Admin to be demoted not found.");
        }

        // Find the user performing the demotion by their ID
        var byUser = await _context.Users.FindAsync(byUserId);
        if (byUser == null)
        {
            return NotFound("The user performing the demotion was not found.");
        }

        // Check if the user performing the demotion is a master admin
        var isByUserMasterAdmin = await _context.Admins
            .Where(a => a.User_Id == byUserId)
            .Select(a => a.Is_Master)
            .FirstOrDefaultAsync();

        if (!isByUserMasterAdmin)
        {
            return Unauthorized("Only a master admin can demote an admin to a regular user.");
        }

        // Demote the admin to a regular user by removing the entry from the Admins table
        _context.Admins.Remove(adminUserToDemote);
        await _context.SaveChangesAsync();

        return Ok("Admin demoted to regular user successfully.");
    }



    [HttpGet("all")]
    public async Task<IActionResult> GetAllUsers()
    {
        // fetch all users from the database
        var users = await _context.Users.ToListAsync();

        // create a list to store the UserInfoDTOs
        var userInfoDTOs = new List<UserInfoDTO>();

        // loop through each user to populate the UserInfoDTO and check admin status
        foreach (var user in users)
        {
            var isAdmin = await PrivilegeUtils.IsUserAdmin(_context, user.Id); // the context is included because the function is in another class
            var isMaster = false;

            if (isAdmin)
            {
                isMaster = await PrivilegeUtils.IsUserMasterAdmin(_context, user.Id);
            }

            var userInfo = new UserInfoDTO
            {
                Id = user.Id,
                FirstName = user.First_Name,
                LastName = user.Last_Name,
                Email = user.Email,
                Gender = user.Gender,
                Birthdate = user.Birthdate,
                Bio = user.Bio,
                IsAdmin = isAdmin,
                IsMaster = isMaster,
                RegistrationAt = user.Registration_At
            };

            userInfoDTOs.Add(userInfo);
        }
        return Ok(userInfoDTOs);
    }

}
