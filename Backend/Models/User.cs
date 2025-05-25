namespace Backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string Education { get; set; }
        public string Experience { get; set; }
        public string Background { get; set; }
        public string AdditionalComments { get; set; }
        public bool IsIdeaSubmitter { get; set; }
        public bool IsFunder { get; set; }
        public string FilePath { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    }
}
