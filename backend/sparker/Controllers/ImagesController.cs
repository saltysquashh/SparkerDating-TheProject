using Microsoft.AspNetCore.Mvc;
using sparker.Database;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using sparker.Models;
using System.Threading.Tasks;

namespace sparker.Controllers
{
    [Route("[controller]")]

    public class ImagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ImagesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllImages()
        {
            var images = await _context.Images.ToListAsync();
            return Ok(images);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetImageById(int id)
        {
            var image = await _context.Images.FindAsync(id);
            if (image == null)
            {
                return NotFound();
            }
            return Ok(image);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserImages(int userId)
        {
            var images = await _context.Images
                                       .Where(img => img.User_Id == userId)
                                       .ToListAsync();
            return Ok(images);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromForm] int userId)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                byte[] fileBytes;
                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    fileBytes = memoryStream.ToArray();
                }

                // Create a new image record with the byte array and userId
                var image = new Image
                {
                    Image_Data = fileBytes,
                    User_Id = userId
                };

                _context.Images.Add(image);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetImageById), new { id = image.Id }, image);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImage(int id)
        {
            var image = await _context.Images.FindAsync(id);
            if (image == null)
            {
                return NotFound();
            }

            _context.Images.Remove(image);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}