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
        public async Task<IActionResult> CreatePreference(CreatePreferenceDTO createPreferenceDTO)
        {
            // Validate the input data
            // Check if the user already exists


            var preference = new Preference
            {
                User_Id = createPreferenceDTO.UserId,
                Sex = createPreferenceDTO.Sex,
                Age_Min = createPreferenceDTO.AgeMin,
                Age_Max = createPreferenceDTO.AgeMax,
            };


            _context.Preferences.Add(preference);
            await _context.SaveChangesAsync();

            return Ok(new { userId = preference.User_Id }); // or other relevant data
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetPreferences(int id)
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



        [HttpPut("{id}")]
        // [Authorize]
        public async Task<IActionResult> UpdatePreferences(int id, [FromBody] UpdatePreferenceDTO updatePreferenceDTO)
        {
            var preference = await _context.Preferences.FirstOrDefaultAsync(p => p.User_Id == id);
            if (preference == null)
            {
                // Create a new preference if not found
                return await CreatePreference(new CreatePreferenceDTO
                {
                    UserId = id,
                    Sex = updatePreferenceDTO.Sex,
                    AgeMin = updatePreferenceDTO.AgeMin,
                    AgeMax = updatePreferenceDTO.AgeMax
                });
            }

            preference.Sex = updatePreferenceDTO.Sex;
            preference.Age_Min = updatePreferenceDTO.AgeMin;
            preference.Age_Max = updatePreferenceDTO.AgeMax;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(preference); // or NoContent() to return nothing
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PreferenceExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
        }


        private bool PreferenceExists(int userId)
        {
            return _context.Preferences.Any(e => e.User_Id == userId);
        }
    }
}
