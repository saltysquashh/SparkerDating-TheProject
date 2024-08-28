using Microsoft.AspNetCore.Mvc;
using sparker.Database;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using sparker.Models;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace sparker.Controllers
{
    [Authorize]
    [Route("[controller]")]

    public class ImagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ImagesController(ApplicationDbContext context)
        {
            _context = context;
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

            // Check if the file is of a valid type (JPG or PNG)
            var validContentTypes = new[] { "image/jpeg", "image/png" };
            var validExtensions = new[] { ".jpg", ".jpeg", ".png" };

            // Check content type
            if (!validContentTypes.Contains(file.ContentType.ToLower()))
            {
                return BadRequest("Invalid file type. Only JPG and PNG files are allowed.");
            }

            // Check file extension (optional, additional check)
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (!validExtensions.Contains(fileExtension))
            {
                return BadRequest("Invalid file extension. Only .jpg, .jpeg, and .png files are allowed.");
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
                return StatusCode(500, $"Internal server error while uploading image: {ex.Message}");
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImage(int id)
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error while deleting image: {ex.Message}");
            }
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

        //[HttpGet]
        //public async Task<IActionResult> GetAllImages()
        //{
        //    var images = await _context.Images.ToListAsync();
        //    return Ok(images);
        //}

    }
}