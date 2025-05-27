namespace SifreKasasi.API.Models
{
    public class AccountRequest
    {
        public string SiteName { get; set; } = null!;
        public string SiteUsername { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
} 