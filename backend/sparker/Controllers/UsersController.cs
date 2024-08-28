using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using sparker.Database;
using sparker.DTOs;
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

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDTO registerDTO)
    {
        try
        {
            var (isValid, errorMessage) = await ValidationUtils.ValidateRegistrationDTO(registerDTO, _context);
            if (!isValid)
            {
                return BadRequest(errorMessage);
            }

            var user = new User
            {
                First_Name = registerDTO.FirstName,
                Last_Name = registerDTO.LastName,
                Email = registerDTO.Email.ToLower(),
                Gender = registerDTO.Gender,
                Birthdate = registerDTO.Birthdate,
                Registration_At = DateTime.Now
            };

            // generates a unique salt for the user, then hashes the salted 
            user.Password_Hash = _passwordHasher.HashPassword(user, registerDTO.Password);

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
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred during registration. {ex.Message}");
        }
    }

    // e-mail pre-check in frontend registration form
    [AllowAnonymous]
    [HttpGet("useremailexists/{email}")]
    public async Task<IActionResult> CheckUserEmailExistsEndpoint(string email)
    {
        try
        {
            bool exists = await ValidationUtils.UserEmailExists(email, _context);
            return Ok(exists);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while checking the email: {ex.Message}");
        }
    }

    [HttpGet("isadmin/{userId}")]
    public async Task<IActionResult> IsAdmin(int userId)
    {
        try
        {
            var isAdmin = await PrivilegeUtils.IsUserAdmin(_context, userId); // the _context is included because the function is in another class
            return Ok(isAdmin);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while checking admin status: {ex.Message}");
        }
    }

    [HttpGet("userinfo/{id}")]
    public async Task<IActionResult> GetUserInfo(int id)
    {
        try
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
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while retrieving user info: {ex.Message}");
        }
    }

    [HttpGet("swipeuserbyid/{id}")]
    public async Task<IActionResult> GetSwipeUserById(int id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound($"User with ID {id} not found.");
            }

            var swipeUserDTO = new SwipeUserDTO
            {
                Id = user.Id,
                FirstName = user.First_Name,
                LastName = user.Last_Name,
                Gender = user.Gender,
                Age = DateUtils.CalculateAge(user.Birthdate),
                Bio = user.Bio,
                Images = _context.Images
                        .Where(i => i.User_Id == user.Id)
                        .Select(i => Convert.ToBase64String(i.Image_Data)) // Convert image data to base 64
                        .ToList()
            };

            return Ok(swipeUserDTO);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while retrieving swipe user info: {ex.Message}");
        }
    }


    [HttpPut("userinfo/{id}")]
    public async Task<IActionResult> UpdateUserInfo(int id, [FromBody] UpdateUserInfoDTO updateUserInfoDTO)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound($"User with ID {id} not found.");
            }

            var (isValid, errorMessage) = await ValidationUtils.ValidateUpdateUserInfoDTO(updateUserInfoDTO, _context);
            if (!isValid)
            {
                return BadRequest(errorMessage);
            }

            // Update user properties
            user.First_Name = updateUserInfoDTO.FirstName;
            user.Last_Name = updateUserInfoDTO.LastName;
            user.Gender = updateUserInfoDTO.Gender;
            user.Birthdate = updateUserInfoDTO.Birthdate;
            // user.Email = updateUserInfoDTO.Email; // Users are not allowed to update their e-mail, so this line was removed

            await _context.SaveChangesAsync();
            return Ok(user);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(id))
            {
                return NotFound($"User with ID {id} no longer exists.");
            }
            return StatusCode(500, "A concurrency error occurred while updating user info.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while updating user info: {ex.Message}");
        }
    }
    private bool UserExists(int id)
    {
        return _context.Users.Any(e => e.Id == id);
    }

    [HttpGet("usercustomization/{id}")]
    public async Task<IActionResult> GetUserCustomization(int id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound($"User with ID {id} not found.");
            }

            var userCustomizationDTO = new UserCustomizationDTO
            {
                Bio = user.Bio,
            };

            return Ok(userCustomizationDTO);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while retrieving user customization: {ex.Message}");
        }
    }


    [HttpPut("userbio/{id}/{newBio}")]
    public async Task<IActionResult> UpdateUserBio(int id, string newBio)
    {
        try
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

            await _context.SaveChangesAsync();
            return Ok(true);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(id))
            {
                return NotFound($"User with ID {id} no longer exists."); // i added this because theoretically the user could be deleted concurrent with this call/action
            }
            return StatusCode(500, "A concurrency error occurred while updating user bio.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while updating user bio: {ex.Message}");
        }
    }

    [HttpGet("getnextswipeuser/{userId}")]
    public async Task<IActionResult> GetNextSwipeUser(int userId)
    {
        try
        {
            var nextUserDTO = await FindNextUser(userId);
            if (nextUserDTO == null)
            {
                return NotFound("No fitting users to swipe on was found.");
            }
            return Ok(nextUserDTO);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while filtering the next swipe user. {ex.Message}");
        }
    }

    private async Task<NextUserDTO> FindNextUser(int userId)
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


        // Filter based on whether the potential match's preferences fit the swiper's user-info
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
            FullName = u.First_Name + " " + u.Last_Name,
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
    public async Task<IActionResult> DeleteUser(int delUserId, int byUserId)
    {
        try
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

            // check if the user being deleted is an admin
            var isDelUserAdmin = await _context.Admins.AnyAsync(a => a.User_Id == delUserId);

            if (isDelUserAdmin)
            {
                // Check if the user performing the deletion is a master admin
                var isByUserMasterAdmin = await _context.Admins
                    .Where(a => a.User_Id == byUserId)
                    .Select(a => a.Is_Master)
                    .FirstOrDefaultAsync();

                // if the user performing the deletion is not a master admin, deny the operation
                if (!isByUserMasterAdmin)
                {
                    return Unauthorized("Only a master admin can delete another admin.");
                }
            }

            await DeleteUserData(delUserId);
            _context.Users.Remove(delUser);
            await _context.SaveChangesAsync();

            return Ok("User and related data deleted successfully.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while deleting the user: {ex.Message}");
        }
    }
    // didnt have enough time to implement deletion Cascades...
    private async Task DeleteUserData(int userId) 
    {
        // find matches where the user are in
        var matches = await _context.Matches
            .Where(m => m.User1_Id == userId || m.User2_Id == userId)
            .ToListAsync();

        // delete related chatmessages of related matches
        foreach (var match in matches)
        {
            var chatMessages = await _context.ChatMessages
                .Where(cm => cm.Match_Id == match.Id)
                .ToListAsync();

            _context.ChatMessages.RemoveRange(chatMessages);
        }

        // delete related matches
        _context.Matches.RemoveRange(matches);

        // delete related swipes
        var swipes = await _context.Swipes
            .Where(s => s.Swiper_UserId == userId || s.Swiped_UserId == userId)
            .ToListAsync();

        _context.Swipes.RemoveRange(swipes);

        // delete related preferences
        var preference = await _context.Preferences
            .FirstOrDefaultAsync(p => p.User_Id == userId);

        if (preference != null)
        {
            _context.Preferences.Remove(preference);
        }

        // delete user images 
        var images = await _context.Images
            .Where(i => i.User_Id == userId)
            .ToListAsync();

        _context.Images.RemoveRange(images);

        // delete admin entry of the user, if they were an admin
        var adminRecord = await _context.Admins
            .FirstOrDefaultAsync(a => a.User_Id == userId);

        if (adminRecord != null)
        {
            _context.Admins.Remove(adminRecord);
        }
    }

    [HttpPost("promote/{userId}/{byUserId}")]
    public async Task<IActionResult> PromoteUserToAdmin(int userId, int byUserId)
    {
        try
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
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while promoting the user to admin: {ex.Message}");
        }
    }

    [HttpPost("demote/{adminUserId}/{byUserId}")]
    public async Task<IActionResult> DemoteAdminToUser(int adminUserId, int byUserId)
    {
        try
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
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while demoting the admin. {ex.Message}");
        }
    }



    [HttpGet("all")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            // fetch all users from the database
            var users = await _context.Users.ToListAsync();

        // create a list to store the UserInfoDTOs
        var userInfoDTOs = new List<UserInfoDTO>();

        // loop through each user to populate the UserInfoDTO and check admin privileges
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
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while retrieving all users: {ex.Message}");
        }
    }

    // user activity summary for welcomepage functionality
    [HttpGet("summary/{userId}")]
    public async Task<IActionResult> GetUserActivitySummary(int userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var lastLoginTime = user.Last_Login_At;

            // New Matches
            var newMatches = await _context.Matches
                .Where(m => (m.User1_Id == userId || m.User2_Id == userId) && m.Matched_At > lastLoginTime)
                .ToListAsync();


            // find expired/ghosted matches
            var expiredMatches = await _context.Matches
                .Where(m => (m.User1_Id == userId || m.User2_Id == userId) && (m.Is_Ghosted)) // TODO && m.Ghosted_At > lastLoginTime ) check new ghost table instead
                .ToListAsync();

            var userActivitySummaryDTO = new UserActivitySummaryDTO
            {
                NewMatches = newMatches.Select(m => new MatchDTO
                {
                    Id = m.Id,
                    User1Id = m.User1_Id,
                    User2Id = m.User2_Id,
                    MatchedAt = m.Matched_At,
                    //IsGhosted = m.Is_Ghosted
                }).ToList(),

                ExpiredMatches = expiredMatches.Select(m => new MatchDTO
                {
                    Id = m.Id,
                    User1Id = m.User1_Id,
                    User2Id = m.User2_Id,
                    MatchedAt = m.Matched_At,
                    //IsGhosted = m.Is_Ghosted
                }).ToList()
            };

            return Ok(userActivitySummaryDTO);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while checking activity summary: {ex.Message}");
        }
    }

}
