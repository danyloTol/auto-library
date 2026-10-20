using Application.Features.Admin;
using Application.Features.Cars.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController : ApiControllerBase
{
    [HttpGet("pending-cars")]
    public async Task<ActionResult<List<CarDetailsDto>>> GetPendingCars()
    {
        var result = await Mediator.Send(new GetPendingCarsQuery());
        return Ok(result);
    }

    [HttpPost("cars/{id:guid}/approve")]
    public async Task<IActionResult> ApproveCar(Guid id)
    {
        await Mediator.Send(new ApproveCarCommand(id));
        return Ok(new { message = "Оголошення успішно схвалено!" });
    }

    public record RejectRequest(string Reason);

    [HttpPost("cars/{id:guid}/reject")]
    public async Task<IActionResult> RejectCar(Guid id, [FromBody] RejectRequest request)
    {
        await Mediator.Send(new RejectCarCommand(id, request.Reason));
        return Ok(new { message = "Оголошення відхилено." });
    }
}
