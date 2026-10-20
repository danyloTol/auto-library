using Application.Features.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[Authorize]
public class ChatController : ApiControllerBase
{
    [HttpPost("rooms/{carId:guid}")]
    public async Task<ActionResult<ChatRoomDto>> GetOrCreateRoom(Guid carId)
    {
        var result = await Mediator.Send(new GetOrCreateChatRoomCommand(carId));
        return Ok(result);
    }

    [HttpGet("rooms")]
    public async Task<ActionResult<List<ChatRoomDto>>> GetMyRooms()
    {
        var result = await Mediator.Send(new GetUserChatRoomsQuery());
        return Ok(result);
    }

    [HttpGet("rooms/{roomId:guid}/messages")]
    public async Task<ActionResult<List<ChatMessageDto>>> GetRoomMessages(Guid roomId)
    {
        var result = await Mediator.Send(new GetChatRoomMessagesQuery(roomId));
        return Ok(result);
    }

    public record SendMessageRequest(string Content);

    [HttpPost("rooms/{roomId:guid}/messages")]
    public async Task<ActionResult<ChatMessageDto>> SendMessage(Guid roomId, [FromBody] SendMessageRequest request)
    {
        var result = await Mediator.Send(new SendMessageCommand(roomId, request.Content));
        return Ok(result);
    }
}
