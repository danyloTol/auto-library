using Application.Features.Reviews;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

public class ReviewsController : ApiControllerBase
{
    [HttpGet("car/{carId:guid}")]
    public async Task<ActionResult<List<ReviewDto>>> GetReviews(Guid carId)
    {
        var result = await Mediator.Send(new GetCarReviewsQuery(carId));
        return Ok(result);
    }

    public record AddReviewRequest(int Rating, string Comment);

    [Authorize]
    [HttpPost("car/{carId:guid}")]
    public async Task<ActionResult<ReviewDto>> AddReview(Guid carId, [FromBody] AddReviewRequest request)
    {
        var command = new AddReviewCommand(carId, request.Rating, request.Comment);
        var result = await Mediator.Send(command);
        return Ok(result);
    }
}
