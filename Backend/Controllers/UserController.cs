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

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> Submit()
        {
            try
            {
                var form = await Request.ReadFormAsync();
                var file = form.Files.GetFile("file");
                var name = form["Name"].ToString().Trim();
                var phone = form["Phone"].ToString().Trim();
                var email = form["Email"].ToString().Trim();
                var address = form["Address"].ToString().Trim();
                var education = form["Education"].ToString().Trim();
                var experience = form["Experience"].ToString().Trim();
                var background = form["Background"].ToString().Trim();
                var additionalComments = form["AdditionalComments"].ToString();

                if (string.IsNullOrWhiteSpace(name) || name.Length < 2)
                    return BadRequest(new { error = "Name must be at least 2 characters." });

                if (string.IsNullOrWhiteSpace(phone) ||
                    !System.Text.RegularExpressions.Regex.IsMatch(phone, @"^\+(?:[0-9] ?){6,14}[0-9]$"))
                    return BadRequest(new { error = "Phone number must include a valid country code." });

                if (string.IsNullOrWhiteSpace(email) ||
                    !System.Net.Mail.MailAddress.TryCreate(email, out _))
                    return BadRequest(new { error = "Email format is invalid." });

                if (string.IsNullOrWhiteSpace(address) || address.Length < 5)
                    return BadRequest(new { error = "Address must be at least 5 characters long." });

                if (string.IsNullOrWhiteSpace(education))
                    return BadRequest(new { error = "Education is required." });

                if (string.IsNullOrWhiteSpace(experience))
                    return BadRequest(new { error = "Experience is required." });

                if (string.IsNullOrWhiteSpace(background) || background.Length < 10)
                    return BadRequest(new { error = "Background must be at least 10 characters." });

                // File validation (optional)
                string? fileName = null;
                if (file != null)
                {
                    var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
                    var extension = Path.GetExtension(file.FileName).ToLower();

                    if (!allowedExtensions.Contains(extension))
                        return BadRequest(new { error = "File must be a PDF or Word document." });

                    if (file.Length > 5 * 1024 * 1024)
                        return BadRequest(new { error = "File size cannot exceed 5MB." });

                    var uploader = new S3Uploader();
                    fileName = await uploader.UploadFileAsync(file);
                }

                var user = new User
                {
                    Name = name,
                    Phone = phone,
                    Email = email,
                    Address = address,
                    Education = education,
                    Experience = experience,
                    Background = background,
                    AdditionalComments = additionalComments,
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
                return BadRequest(new { error = "Something went wrong while processing your request." });
            }
        }
}
}
