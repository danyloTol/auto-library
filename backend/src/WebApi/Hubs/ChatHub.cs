using Application.Features.Chat;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace WebApi.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly ISender _mediator;

    public ChatHub(ISender mediator)
    {
        _mediator = mediator;
    }

    public async Task JoinRoom(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
    }

    public async Task LeaveRoom(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
    }

    public async Task SendMessage(string roomId, string content)
    {
        if (Guid.TryParse(roomId, out var parsedRoomId))
        {
            var message = await _mediator.Send(new SendMessageCommand(parsedRoomId, content));
            await Clients.Group(roomId).SendAsync("ReceiveMessage", message);
        }
    }
}
