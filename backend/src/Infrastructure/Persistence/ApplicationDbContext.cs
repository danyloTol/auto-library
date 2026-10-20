using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<CarImage> CarImages => Set<CarImage>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<ChatRoom> ChatRooms => Set<ChatRoom>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(200);
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(150);
            entity.Property(u => u.PasswordHash).IsRequired();
        });

        // Car
        modelBuilder.Entity<Car>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Title).IsRequired().HasMaxLength(200);
            entity.Property(c => c.Brand).IsRequired().HasMaxLength(100);
            entity.Property(c => c.Model).IsRequired().HasMaxLength(100);
            entity.Property(c => c.Price).HasPrecision(18, 2);
            entity.Property(c => c.City).IsRequired().HasMaxLength(100);

            entity.HasOne(c => c.User)
                  .WithMany(u => u.Cars)
                  .HasForeignKey(c => c.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // CarImage
        modelBuilder.Entity<CarImage>(entity =>
        {
            entity.HasKey(i => i.Id);
            entity.Property(i => i.ImageUrl).IsRequired();

            entity.HasOne(i => i.Car)
                  .WithMany(c => c.Images)
                  .HasForeignKey(i => i.CarId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Review
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Comment).IsRequired().HasMaxLength(1000);

            entity.HasOne(r => r.Car)
                  .WithMany(c => c.Reviews)
                  .HasForeignKey(r => r.CarId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.User)
                  .WithMany(u => u.Reviews)
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Favorite
        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.HasKey(f => f.Id);
            entity.HasIndex(f => new { f.UserId, f.CarId }).IsUnique();

            entity.HasOne(f => f.User)
                  .WithMany(u => u.Favorites)
                  .HasForeignKey(f => f.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(f => f.Car)
                  .WithMany(c => c.Favorites)
                  .HasForeignKey(f => f.CarId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ChatRoom
        modelBuilder.Entity<ChatRoom>(entity =>
        {
            entity.HasKey(r => r.Id);

            entity.HasOne(r => r.Car)
                  .WithMany(c => c.ChatRooms)
                  .HasForeignKey(r => r.CarId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.Buyer)
                  .WithMany(u => u.BuyerChatRooms)
                  .HasForeignKey(r => r.BuyerId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Seller)
                  .WithMany(u => u.SellerChatRooms)
                  .HasForeignKey(r => r.SellerId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ChatMessage
        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Content).IsRequired().HasMaxLength(2000);

            entity.HasOne(m => m.ChatRoom)
                  .WithMany(r => r.Messages)
                  .HasForeignKey(m => m.ChatRoomId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.Sender)
                  .WithMany(u => u.SentMessages)
                  .HasForeignKey(m => m.SenderId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
