using Domain.Common;

namespace Domain.Entities;

public class CarImage : BaseEntity
{
    public Guid CarId { get; set; }
    public Car Car { get; set; } = null!;

    public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}
