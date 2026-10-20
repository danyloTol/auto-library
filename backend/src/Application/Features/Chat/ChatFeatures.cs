using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Chat;

public record ChatUserDto(Guid Id, string FullName, string Email);

public record ChatRoomDto(
    Guid Id,
    Guid CarId,
    string CarTitle,
    string? CarImageUrl,
    ChatUserDto Buyer,
    ChatUserDto Seller,
    string? LastMessage,
    DateTime? LastMessageDate,
    int UnreadCount,
    DateTime CreatedAt
);

public record ChatMessageDto(
    Guid Id,
    Guid ChatRoomId,
    Guid SenderId,
    string SenderName,
    string Content,
    bool IsRead,
    DateTime CreatedAt
);

public record GetOrCreateChatRoomCommand(Guid CarId) : IRequest<ChatRoomDto>;

public class GetOrCreateChatRoomCommandHandler : IRequestHandler<GetOrCreateChatRoomCommand, ChatRoomDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetOrCreateChatRoomCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ChatRoomDto> Handle(GetOrCreateChatRoomCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            throw new UnauthorizedException();
        }

        var currentUserId = _currentUserService.UserId.Value;

        var car = await _context.Cars
            .Include(c => c.Images)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == request.CarId, cancellationToken);

        if (car == null)
        {
            throw new NotFoundException("Car", request.CarId);
        }

        if (car.UserId == currentUserId)
        {
            throw new BadRequestException("Ви не можете відкрити чат із самим собою як продавцем.");
        }

        var room = await _context.ChatRooms
            .Include(r => r.Car)
                .ThenInclude(c => c.Images)
            .Include(r => r.Buyer)
            .Include(r => r.Seller)
            .Include(r => r.Messages)
            .FirstOrDefaultAsync(r => r.CarId == request.CarId && r.BuyerId == currentUserId, cancellationToken);

        if (room == null)
        {
            room = new ChatRoom
            {
                CarId = car.Id,
                BuyerId = currentUserId,
                SellerId = car.UserId
            };

            _context.ChatRooms.Add(room);
            await _context.SaveChangesAsync(cancellationToken);

            // Reload for navigation properties
            room = await _context.ChatRooms
                .Include(r => r.Car)
                    .ThenInclude(c => c.Images)
                .Include(r => r.Buyer)
                .Include(r => r.Seller)
                .Include(r => r.Messages)
                .FirstAsync(r => r.Id == room.Id, cancellationToken);
        }

        var lastMsg = room.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault();
        var unread = room.Messages.Count(m => !m.IsRead && m.SenderId != currentUserId);
        var carImg = room.Car.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl
                     ?? room.Car.Images.FirstOrDefault()?.ImageUrl;

        return new ChatRoomDto(
            room.Id,
            room.CarId,
            room.Car.Title,
            carImg,
            new ChatUserDto(room.Buyer.Id, room.Buyer.FullName, room.Buyer.Email),
            new ChatUserDto(room.Seller.Id, room.Seller.FullName, room.Seller.Email),
            lastMsg?.Content,
            lastMsg?.CreatedAt,
            unread,
            room.CreatedAt
        );
    }
}

public record GetUserChatRoomsQuery : IRequest<List<ChatRoomDto>>;

public class GetUserChatRoomsQueryHandler : IRequestHandler<GetUserChatRoomsQuery, List<ChatRoomDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetUserChatRoomsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<ChatRoomDto>> Handle(GetUserChatRoomsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            throw new UnauthorizedException();
        }

        var userId = _currentUserService.UserId.Value;

        var rooms = await _context.ChatRooms
            .AsNoTracking()
            .Where(r => r.BuyerId == userId || r.SellerId == userId)
            .Include(r => r.Car)
                .ThenInclude(c => c.Images)
            .Include(r => r.Buyer)
            .Include(r => r.Seller)
            .Include(r => r.Messages)
            .OrderByDescending(r => r.Messages.Any() ? r.Messages.Max(m => m.CreatedAt) : r.CreatedAt)
            .ToListAsync(cancellationToken);

        return rooms.Select(r =>
        {
            var lastMsg = r.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault();
            var unread = r.Messages.Count(m => !m.IsRead && m.SenderId != userId);
            var carImg = r.Car.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl
                         ?? r.Car.Images.FirstOrDefault()?.ImageUrl;

            return new ChatRoomDto(
                r.Id,
                r.CarId,
                r.Car.Title,
                carImg,
                new ChatUserDto(r.Buyer.Id, r.Buyer.FullName, r.Buyer.Email),
                new ChatUserDto(r.Seller.Id, r.Seller.FullName, r.Seller.Email),
                lastMsg?.Content,
                lastMsg?.CreatedAt,
                unread,
                r.CreatedAt
            );
        }).ToList();
    }
}

public record GetChatRoomMessagesQuery(Guid ChatRoomId) : IRequest<List<ChatMessageDto>>;

public class GetChatRoomMessagesQueryHandler : IRequestHandler<GetChatRoomMessagesQuery, List<ChatMessageDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetChatRoomMessagesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<ChatMessageDto>> Handle(GetChatRoomMessagesQuery request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            throw new UnauthorizedException();
        }

        var userId = _currentUserService.UserId.Value;

        var room = await _context.ChatRooms
            .Include(r => r.Messages)
            .FirstOrDefaultAsync(r => r.Id == request.ChatRoomId, cancellationToken);

        if (room == null)
        {
            throw new NotFoundException("ChatRoom", request.ChatRoomId);
        }

        if (room.BuyerId != userId && room.SellerId != userId)
        {
            throw new ForbiddenException();
        }

        // Mark incoming messages as read
        var unreadMessages = room.Messages.Where(m => !m.IsRead && m.SenderId != userId).ToList();
        if (unreadMessages.Any())
        {
            foreach (var m in unreadMessages)
            {
                m.IsRead = true;
            }
            await _context.SaveChangesAsync(cancellationToken);
        }

        var messages = await _context.ChatMessages
            .AsNoTracking()
            .Where(m => m.ChatRoomId == request.ChatRoomId)
            .Include(m => m.Sender)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new ChatMessageDto(
                m.Id,
                m.ChatRoomId,
                m.SenderId,
                m.Sender.FullName,
                m.Content,
                m.IsRead,
                m.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return messages;
    }
}

public record SendMessageCommand(Guid ChatRoomId, string Content) : IRequest<ChatMessageDto>;

public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
{
    public SendMessageCommandValidator()
    {
        RuleFor(x => x.Content).NotEmpty().MaximumLength(2000);
    }
}

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, ChatMessageDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public SendMessageCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ChatMessageDto> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            throw new UnauthorizedException();
        }

        var userId = _currentUserService.UserId.Value;

        var room = await _context.ChatRooms.FirstOrDefaultAsync(r => r.Id == request.ChatRoomId, cancellationToken);
        if (room == null)
        {
            throw new NotFoundException("ChatRoom", request.ChatRoomId);
        }

        if (room.BuyerId != userId && room.SellerId != userId)
        {
            throw new ForbiddenException();
        }

        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null)
        {
            throw new UnauthorizedException();
        }

        var msg = new ChatMessage
        {
            ChatRoomId = room.Id,
            SenderId = userId,
            Content = request.Content.Trim(),
            IsRead = false
        };

        _context.ChatMessages.Add(msg);
        await _context.SaveChangesAsync(cancellationToken);

        return new ChatMessageDto(msg.Id, msg.ChatRoomId, user.Id, user.FullName, msg.Content, msg.IsRead, msg.CreatedAt);
    }
}
