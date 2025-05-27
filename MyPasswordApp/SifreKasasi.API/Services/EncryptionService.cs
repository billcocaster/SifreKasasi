using System.Security.Cryptography;
using System.Text;

namespace SifreKasasi.API.Services
{
    public class EncryptionService
    {
        // Configuration ve Key/IV alanlarını kaldırıyoruz
        // private readonly IConfiguration _configuration;
        // private readonly byte[] _key;
        // private readonly byte[] _iv;

        public EncryptionService()
        {
            // Yapıcı metod artık konfigürasyon almıyor
        }

        private (byte[] key, byte[] iv) DeriveKeyAndIV(string userPasswordHash)
        {
             using var deriveBytes = new Rfc2898DeriveBytes(
                userPasswordHash, // Anahtar türetmek için kullanıcının hashlenmiş şifresi
                new byte[] { 8, 7, 6, 5, 4, 3, 2, 1 }, // Farklı bir Salt kullanabiliriz veya aynı
                10000); // Daha yüksek iterasyon sayısı daha güvenli olabilir
            var key = deriveBytes.GetBytes(32); // 256-bit key
            var iv = deriveBytes.GetBytes(16);  // 128-bit IV
            return (key, iv);
        }

        public string Encrypt(string plainText, string userPasswordHash)
        {
            var (key, iv) = DeriveKeyAndIV(userPasswordHash);

            using var aes = Aes.Create();
            aes.Key = key;
            aes.IV = iv;

            using var encryptor = aes.CreateEncryptor();
            using var msEncrypt = new MemoryStream();
            using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
            using (var swEncrypt = new StreamWriter(csEncrypt))
            {
                swEncrypt.Write(plainText);
            }

            return Convert.ToBase64String(msEncrypt.ToArray());
        }

        public string Decrypt(string cipherText, string userPasswordHash)
        {
             var (key, iv) = DeriveKeyAndIV(userPasswordHash);

            using var aes = Aes.Create();
            aes.Key = key;
            aes.IV = iv;

            using var decryptor = aes.CreateDecryptor();
            using var msDecrypt = new MemoryStream(Convert.FromBase64String(cipherText));
            using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
            using var srDecrypt = new StreamReader(csDecrypt);

            return srDecrypt.ReadToEnd();
        }
    }
} 