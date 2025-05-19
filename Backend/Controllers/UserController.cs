using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public UserController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> Submit()
        {
            try
            {
                var form = await Request.ReadFormAsync();

                var file = form.Files.GetFile("file");
                string? fileName = null;

                // Handle file upload
                if (file != null)
                {
                    var uploadDir = Path.Combine(_env.ContentRootPath, "Uploads");
                    if (!Directory.Exists(uploadDir))
                        Directory.CreateDirectory(uploadDir);

                    fileName = $"{Guid.NewGuid()}_{file.FileName}";
                    var filePath = Path.Combine(uploadDir, fileName);

                    using var stream = new FileStream(filePath, FileMode.Create);
                    await file.CopyToAsync(stream);
                }

                // Map form fields to User model
                var user = new User
                {
                    Name = form["Name"],
                    Phone = form["Phone"],
                    Email = form["Email"],
                    Address = form["Address"],
                    Education = form["Education"],
                    Experience = form["Experience"],
                    Background = form["Background"],
                    AdditionalComments = form["AdditionalComments"],
                    IsIdeaSubmitter = bool.TryParse(form["IsIdeaSubmitter"], out var idea) && idea,
                    IsFunder = bool.TryParse(form["IsFunder"], out var fund) && fund,
                    FilePath = fileName ?? string.Empty
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Submission successful" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("admin")]
        public IActionResult GetSubmissions([FromForm] string email)
        {
            // Replace with your admin email
            var allowedAdminEmail = "admin@example.com";

            if (email != allowedAdminEmail)
            {
                return Unauthorized(new { message = "Access denied" });
            }

            var users = _context.Users.ToList(); // Fetch all submissions
            return Ok(users);
        }
    }
}
