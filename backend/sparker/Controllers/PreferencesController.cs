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

namespace sparker.Controllers
{
    [Authorize]
    [Route("[controller]")]

    public class PreferencesController : ControllerBase
    {

        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public PreferencesController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;

            _configuration = configuration;
        }


        [HttpPost("createpreference")]
        public async Task<IActionResult> CreatePreference([FromBody] PreferenceDTO preferenceDTO)
        {
            // if preferenceDTO is null, though it's very unlikely if even possible that it could happen at all
            if (preferenceDTO == null)
            {
                return BadRequest("Preference data is required.");
            }

            // Check if a preference for this user already exists
            var existingPreference = await _context.Preferences.FirstOrDefaultAsync(p => p.User_Id == preferenceDTO.UserId);
            if (existingPreference != null)
            {
                return BadRequest("A preference for this user already exists.");
            }

            try
            {
                var preference = new Preference
                {
                    User_Id = preferenceDTO.UserId,
                    Sex = preferenceDTO.Sex,
                    Age_Min = preferenceDTO.AgeMin,
                    Age_Max = preferenceDTO.AgeMax,
                };

                _context.Preferences.Add(preference);
                await _context.SaveChangesAsync();

                return Ok(new { userId = preference.User_Id });
            }
            catch (DbUpdateException ex)
            {

                return StatusCode(500, $"An error occurred while creating the preference: {ex.Message}");
            }
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetPreferences(int id)
        {
            try
            {
                var preference = await _context.Preferences.FindAsync(id);

                if (preference == null)
                {
                    return NotFound($"Preference with ID {id} not found.");
                }

                var preferenceDetail = new PreferenceDTO
                {
                    Sex = preference.Sex,
                    AgeMin = preference.Age_Min,
                    AgeMax = preference.Age_Max,
                };

                return Ok(preferenceDetail);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching the preference: {ex.Message}");
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePreferences(int id, [FromBody] PreferenceDTO preferenceDTO)
        {
            if (preferenceDTO == null)
            {
                return BadRequest("Preference data is required.");
            }

            try
            {
                var preference = await _context.Preferences.FirstOrDefaultAsync(p => p.User_Id == id);
                if (preference != null)
                {
                    preference.Sex = preferenceDTO.Sex;
                    preference.Age_Min = preferenceDTO.AgeMin;
                    preference.Age_Max = preferenceDTO.AgeMax;
                }
                else
                {
                    // Create a new preference if one for the user did not exist
                    var newPreference = new Preference
                    {
                        User_Id = preferenceDTO.UserId,
                        Sex = preferenceDTO.Sex,
                        Age_Min = preferenceDTO.AgeMin,
                        Age_Max = preferenceDTO.AgeMax,
                    };

                    _context.Preferences.Add(newPreference);
                }

                await _context.SaveChangesAsync();
                return Ok(preference);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PreferenceExists(id))
                {
                    return NotFound($"Preference with ID {id} not found.");
                }
                else
                {
                    return StatusCode(500, "A concurrency error occurred while updating the preference.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while updating the preference. {ex.Message}");
            }
        }


        private bool PreferenceExists(int userId)
        {
            return _context.Preferences.Any(e => e.User_Id == userId);
        }
    }
}
