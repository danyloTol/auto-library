using Application.Common.Models;
using Application.Features.Cars.Commands;
using Application.Features.Cars.DTOs;
using Application.Features.Cars.Queries;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

public class CarsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<CarSummaryDto>>> GetCars([FromQuery] GetCarsQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CarDetailsDto>> GetCarById(Guid id)
    {
        var result = await Mediator.Send(new GetCarByIdQuery(id));
        return Ok(result);
    }

    [Authorize]
    [HttpGet("my")]
    public async Task<ActionResult<List<CarSummaryDto>>> GetMyCars()
    {
        var result = await Mediator.Send(new GetUserCarsQuery());
        return Ok(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Guid>> CreateCar([FromBody] CreateCarRequest request)
    {
        var command = new CreateCarCommand(
            request.Title,
            request.Brand,
            request.Model,
            request.Year,
            request.Price,
            request.Mileage,
            request.FuelType,
            request.Transmission,
            request.EngineCapacity,
            request.Description,
            request.City
        );

        var id = await Mediator.Send(command);
        return CreatedAtAction(nameof(GetCarById), new { id }, id);
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCar(Guid id, [FromBody] UpdateCarRequest request)
    {
        var command = new UpdateCarCommand(
            id,
            request.Title,
            request.Brand,
            request.Model,
            request.Year,
            request.Price,
            request.Mileage,
            request.FuelType,
            request.Transmission,
            request.EngineCapacity,
            request.Description,
            request.City
        );

        await Mediator.Send(command);
        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCar(Guid id)
    {
        await Mediator.Send(new DeleteCarCommand(id));
        return NoContent();
    }

    [Authorize]
    [HttpPost("{id:guid}/images")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<List<CarImageDto>>> UploadImages(Guid id, [FromForm] IFormFileCollection files)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest("Не вибрано жодного файлу.");
        }

        var uploadModels = new List<FileUploadModel>();
        foreach (var file in files)
        {
            if (file.Length > 0)
            {
                uploadModels.Add(new FileUploadModel(file.OpenReadStream(), file.FileName));
            }
        }

        var result = await Mediator.Send(new UploadCarImagesCommand(id, uploadModels));
        return Ok(result);
    }
}
