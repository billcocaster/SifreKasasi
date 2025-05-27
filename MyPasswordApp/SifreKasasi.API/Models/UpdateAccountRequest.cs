namespace SifreKasasi.API.Models
{
    public class UpdateAccountRequest
    {
        public int Id { get; set; }
        public string SiteName { get; set; } = null!;
        public string SiteUsername { get; set; } = null!;
        public string? Password { get; set; } // Şifre güncellenmeyebilir
    }
} 