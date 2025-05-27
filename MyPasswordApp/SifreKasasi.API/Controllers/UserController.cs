using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SifreKasasi.API.Models;
using SifreKasasi.API.Helpers;
using SifreKasasi.API.Services;
using SifreKasasi.Data;
using SifreKasasi.Data.Entities;
using System.Security.Claims;

namespace SifreKasasi.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtService _jwtService;

        public UserController(AppDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            // Kullanıcı adı benzersiz mi?
            if (_context.Users.Any(u => u.Username == request.Username))
            {
                return BadRequest("Bu kullanıcı adı zaten kullanılıyor.");
            }

            var hashedPassword = PasswordHasher.HashPassword(request.Password);

            var user = new User
            {
                Username = request.Username,
                PasswordHash = hashedPassword,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok("Kayıt başarılı.");
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == request.Username);
            
            if (user == null)
            {
                return Unauthorized("Kullanıcı adı veya şifre hatalı.");
            }

            var hashedPassword = PasswordHasher.HashPassword(request.Password);
            
            if (user.PasswordHash != hashedPassword)
            {
                return Unauthorized("Kullanıcı adı veya şifre hatalı.");
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                message = "Giriş başarılı",
                token = token,
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName
                }
            });
        }

        [Authorize]
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var user = _context.Users.Find(userId);

            if (user == null)
            {
                return NotFound("Kullanıcı bulunamadı.");
            }

            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName
            });
        }
    }
}