using System.Security.Cryptography;
using System.Text;

namespace SifreKasasi.API.Services
{
    public class EncryptionService
    {
        private readonly IConfiguration _configuration;
        private readonly byte[] _key;
        private readonly byte[] _iv;

        public EncryptionService(IConfiguration configuration)
        {
            _configuration = configuration;
            // Anahtar ve IV'yi oluştur (gerçek uygulamada bunlar güvenli bir şekilde saklanmalı)
            using var deriveBytes = new Rfc2898DeriveBytes(
                _configuration["JwtSettings:SecretKey"]!,
                new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 }, // Salt
                1000);
            _key = deriveBytes.GetBytes(32); // 256-bit key
            _iv = deriveBytes.GetBytes(16);  // 128-bit IV
        }

        public string Encrypt(string plainText)
        {
            using var aes = Aes.Create();
            aes.Key = _key;
            aes.IV = _iv;

            using var encryptor = aes.CreateEncryptor();
            using var msEncrypt = new MemoryStream();
            using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
            using (var swEncrypt = new StreamWriter(csEncrypt))
            {
                swEncrypt.Write(plainText);
            }

            return Convert.ToBase64String(msEncrypt.ToArray());
        }

        public string Decrypt(string cipherText)
        {
            using var aes = Aes.Create();
            aes.Key = _key;
            aes.IV = _iv;

            using var decryptor = aes.CreateDecryptor();
            using var msDecrypt = new MemoryStream(Convert.FromBase64String(cipherText));
            using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
            using var srDecrypt = new StreamReader(csDecrypt);

            return srDecrypt.ReadToEnd();
        }
    }
} 