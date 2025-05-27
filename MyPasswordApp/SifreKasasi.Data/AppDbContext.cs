using Microsoft.EntityFrameworkCore;
using SifreKasasi.Data.Entities;

namespace SifreKasasi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Account> Accounts => Set<Account>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Username benzersiz
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(u => u.Username)
                .IsRequired();

            modelBuilder.Entity<Account>()
                .Property(a => a.SiteName)
                .IsRequired();

            modelBuilder.Entity<Account>()
                .Property(a => a.SiteUsername)
                .IsRequired();

            modelBuilder.Entity<Account>()
                .Property(a => a.EncryptedPassword)
                .IsRequired();
        }
    }
}