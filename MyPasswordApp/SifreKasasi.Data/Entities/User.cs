namespace SifreKasasi.Data.Entities
{
    public class User
    {
        public int Id { get; set; }

        public string Username { get; set; } = null!;
        public string PasswordHash { get; set; } = null!; // Hashlenmiş şifre
        public string Email { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;

        public ICollection<Account> Accounts { get; set; } = new List<Account>();
    }
}