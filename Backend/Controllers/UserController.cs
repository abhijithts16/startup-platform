using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon;

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

                // Upload to S3 if file exists
                if (file != null)
                {
                    var uploader = new S3Uploader();
                    fileName = await uploader.UploadFileAsync(file);
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
                    FilePath = fileName ?? string.Empty // this is now the S3 key
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

        [HttpGet("file-url")]
        public IActionResult GetFileUrl([FromQuery] string key)
        {
            var config = new AmazonS3Config
            {
                RegionEndpoint = RegionEndpoint.EUNorth1,
                ForcePathStyle = true
            };

            var s3Client = new AmazonS3Client(
                Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID"),
                Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY"),
                config
            );

            var request = new GetPreSignedUrlRequest
            {
                BucketName = "algi-startup-uploads",
                Key = key,
                Expires = DateTime.UtcNow.AddMinutes(15)
            };

            var url = s3Client.GetPreSignedURL(request);
            return Ok(new { url });
        }

    }
}
