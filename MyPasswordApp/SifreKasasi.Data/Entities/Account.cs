namespace SifreKasasi.Data.Entities
{
    public class Account
    {
        public int Id { get; set; }

        public string SiteName { get; set; } = null!;
        public string SiteUsername { get; set; } = null!;
        public string EncryptedPassword { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}