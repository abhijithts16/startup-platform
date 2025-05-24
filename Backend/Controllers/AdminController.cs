using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login([FromForm] string email, [FromForm] string password)
        {
            var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL");
            var adminPasswordHash = Environment.GetEnvironmentVariable("ADMIN_PASSWORD_HASH");

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                return BadRequest(new { error = "Email and password are required." });

            if (email != adminEmail)
                return Unauthorized(new { error = "Invalid email" });

            if (!BCrypt.Net.BCrypt.Verify(password, adminPasswordHash))
                return Unauthorized(new { error = "Invalid credentials" });

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET"));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, "Admin")
        }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { token = tokenString });
        }



        [HttpGet("submissions")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetSubmissions()
        {
            var users = _context.Users.OrderByDescending(u => u.Id).ToList();
            return Ok(users);
        }


        [HttpGet("file-url")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetFileUrl([FromQuery] string key)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                return BadRequest(new { error = "File key is required." });
            }

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

        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSubmission(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // If file exists, delete from S3
            if (!string.IsNullOrWhiteSpace(user.FilePath))
            {
                var s3Client = new AmazonS3Client(
                    Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID"),
                    Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY"),
                    new AmazonS3Config
                    {
                        RegionEndpoint = RegionEndpoint.EUNorth1,
                        ForcePathStyle = true
                    });

                try
                {
                    var deleteRequest = new DeleteObjectRequest
                    {
                        BucketName = "algi-startup-uploads",
                        Key = user.FilePath
                    };

                    await s3Client.DeleteObjectAsync(deleteRequest);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to delete file from S3: {ex.Message}");
                    // Continue even if file delete fails
                }
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Submission deleted successfully." });
        }


    }
}
