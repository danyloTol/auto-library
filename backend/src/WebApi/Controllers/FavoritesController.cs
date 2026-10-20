using Application.Features.Cars.DTOs;
using Application.Features.Favorites;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[Authorize]
public class FavoritesController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CarSummaryDto>>> GetFavorites()
    {
        var result = await Mediator.Send(new GetUserFavoritesQuery());
        return Ok(result);
    }

    [HttpPost("{carId:guid}/toggle")]
    public async Task<ActionResult<bool>> ToggleFavorite(Guid carId)
    {
        var isFavorite = await Mediator.Send(new ToggleFavoriteCommand(carId));
        return Ok(new { isFavorite, message = isFavorite ? "Додано в обране" : "Видалено з обраного" });
    }
}
