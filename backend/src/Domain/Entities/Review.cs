using Domain.Common;

namespace Domain.Entities;

public class Review : BaseEntity
{
    public Guid CarId { get; set; }
    public Car Car { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public int Rating { get; set; } // 1-5
    public string Comment { get; set; } = string.Empty;
}
