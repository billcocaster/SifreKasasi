using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using SifreKasasi.API.Models;
using SifreKasasi.API.Services;
using SifreKasasi.Data;
using SifreKasasi.Data.Entities;
using Microsoft.EntityFrameworkCore; // Include for Include method

namespace SifreKasasi.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EncryptionService _encryptionService;

        public AccountController(AppDbContext context, EncryptionService encryptionService)
        {
            _context = context;
            _encryptionService = encryptionService;
        }

        [HttpPost]
        public IActionResult CreateAccount([FromBody] AccountRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            
            // Kullanıcıyı ve hashlenmiş şifresini al
            var user = _context.Users.Find(userId);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            // Şifreyi kullanıcının hashlenmiş şifresiyle şifrele
            var encryptedPassword = _encryptionService.Encrypt(request.Password, user.PasswordHash);

            var account = new Account
            {
                SiteName = request.SiteName,
                SiteUsername = request.SiteUsername,
                EncryptedPassword = encryptedPassword,
                UserId = userId
            };

            _context.Accounts.Add(account);
            _context.SaveChanges();

            return Ok(new
            {
                message = "Şifre başarıyla kaydedildi",
                account = new
                {
                    id = account.Id,
                    siteName = account.SiteName,
                    siteUsername = account.SiteUsername
                    // Şifreyi response'da dönmüyoruz
                }
            });
        }

        [HttpGet]
        public IActionResult GetAccounts()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            // Kullanıcının hesaplarını ve kullanıcı objesini (hashlenmiş şifre için) Include ile al
            var user = _context.Users.Include(u => u.Accounts)
                                    .FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            var accounts = user.Accounts.Select(a => new AccountResponse
                {
                    Id = a.Id,
                    SiteName = a.SiteName,
                    SiteUsername = a.SiteUsername
                })
                .ToList();

            return Ok(accounts);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateAccount(int id, [FromBody] UpdateAccountRequest request)
        {
            // İstek body'sindeki ID ile URL'deki ID'nin eşleştiğinden emin ol
            if (id != request.Id)
            {
                return BadRequest("ID mismatch.");
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            // Kullanıcıyı ve hesabı al
            var user = _context.Users.Find(userId);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            // Kullanıcının bu hesaba erişimi olduğunu doğrula
            var account = _context.Accounts.FirstOrDefault(a => a.Id == id && a.UserId == userId);

            if (account == null)
            {
                // Hesap bulunamadı veya kullanıcı bu hesaba sahip değil
                return NotFound("Account not found or access denied.");
            }

            // Alanları güncelle
            account.SiteName = request.SiteName;
            account.SiteUsername = request.SiteUsername;

            // Şifre güncellenmek isteniyorsa şifreyi kullanıcının hashlenmiş şifresiyle şifrele ve kaydet
            if (!string.IsNullOrEmpty(request.Password))
            {
                account.EncryptedPassword = _encryptionService.Encrypt(request.Password, user.PasswordHash);
            }

            _context.Accounts.Update(account);
            _context.SaveChanges();

            return Ok(new { message = "Account updated successfully." });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteAccount(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            // Kullanıcının bu hesaba erişimi olduğunu doğrula
            var account = _context.Accounts.FirstOrDefault(a => a.Id == id && a.UserId == userId);

            if (account == null)
            {
                // Hesap bulunamadı veya kullanıcı bu hesaba sahip değil
                return NotFound("Account not found or access denied.");
            }

            _context.Accounts.Remove(account);
            _context.SaveChanges();

            return Ok(new { message = "Account deleted successfully." });
        }

        [HttpGet("{id}/decrypt")]
        public IActionResult DecryptAccountPassword(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            // Kullanıcıyı ve hesabı al
             var user = _context.Users.Find(userId);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            // Kullanıcının bu hesaba erişimi olduğunu doğrula
            var account = _context.Accounts.FirstOrDefault(a => a.Id == id && a.UserId == userId);

            if (account == null)
            {
                // Hesap bulunamadı veya kullanıcı bu hesaba sahip değil
                return NotFound("Account not found or access denied.");
            }

            try
            {
                // Şifreyi kullanıcının hashlenmiş şifresiyle çöz
                var decryptedPassword = _encryptionService.Decrypt(account.EncryptedPassword, user.PasswordHash);
                return Ok(new { password = decryptedPassword });
            }
            catch (System.Security.Cryptography.CryptographicException ex)
            {
                // Şifre çözme hatası (örneğin anahtar değiştiyse)
                return StatusCode(500, "Error decrypting password.");
            }
             catch (Exception ex)
            {
                // Diğer hatalar
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetAccount(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var account = _context.Accounts
                .FirstOrDefault(a => a.Id == id && a.UserId == userId);

            if (account == null)
                return NotFound("Account not found or access denied.");

            return Ok(new
            {
                id = account.Id,
                siteName = account.SiteName,
                siteUsername = account.SiteUsername
                // Şifreyi burada göndermiyoruz!
            });
        }
    }
} 