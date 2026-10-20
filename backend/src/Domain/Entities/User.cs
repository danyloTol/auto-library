using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; } = UserRole.User;

    // Navigation properties
    public ICollection<Car> Cars { get; set; } = new List<Car>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<ChatRoom> BuyerChatRooms { get; set; } = new List<ChatRoom>();
    public ICollection<ChatRoom> SellerChatRooms { get; set; } = new List<ChatRoom>();
    public ICollection<ChatMessage> SentMessages { get; set; } = new List<ChatMessage>();
}
