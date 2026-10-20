using Domain.Common;

namespace Domain.Entities;

public class Favorite : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid CarId { get; set; }
    public Car Car { get; set; } = null!;
}
