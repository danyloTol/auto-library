using Domain.Common;

namespace Domain.Entities;

public class ChatRoom : BaseEntity
{
    public Guid CarId { get; set; }
    public Car Car { get; set; } = null!;

    public Guid BuyerId { get; set; }
    public User Buyer { get; set; } = null!;

    public Guid SellerId { get; set; }
    public User Seller { get; set; } = null!;

    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
