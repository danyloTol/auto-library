using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class Car : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public decimal Price { get; set; }
    public int Mileage { get; set; }
    public FuelType FuelType { get; set; }
    public Transmission Transmission { get; set; }
    public double EngineCapacity { get; set; }
    public string Description { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;

    public CarStatus Status { get; set; } = CarStatus.Pending;
    public string? RejectionReason { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ICollection<CarImage> Images { get; set; } = new List<CarImage>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<ChatRoom> ChatRooms { get; set; } = new List<ChatRoom>();
}
