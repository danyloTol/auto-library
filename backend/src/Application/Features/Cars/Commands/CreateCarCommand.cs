using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Cars.DTOs;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.Cars.Commands;

public record CreateCarCommand(
    string Title,
    string Brand,
    string Model,
    int Year,
    decimal Price,
    int Mileage,
    FuelType FuelType,
    Transmission Transmission,
    double EngineCapacity,
    string Description,
    string City
) : IRequest<Guid>;

public class CreateCarCommandValidator : AbstractValidator<CreateCarCommand>
{
    public CreateCarCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Brand).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Model).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Year).InclusiveBetween(1900, DateTime.UtcNow.Year + 1);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.Mileage).GreaterThanOrEqualTo(0);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(5000);
    }
}

public class CreateCarCommandHandler : IRequestHandler<CreateCarCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateCarCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateCarCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            throw new UnauthorizedException();
        }

        var car = new Car
        {
            Title = request.Title.Trim(),
            Brand = request.Brand.Trim(),
            Model = request.Model.Trim(),
            Year = request.Year,
            Price = request.Price,
            Mileage = request.Mileage,
            FuelType = request.FuelType,
            Transmission = request.Transmission,
            EngineCapacity = request.EngineCapacity,
            Description = request.Description.Trim(),
            City = request.City.Trim(),
            Status = CarStatus.Pending, // Requires admin approval
            UserId = _currentUserService.UserId.Value
        };

        _context.Cars.Add(car);
        await _context.SaveChangesAsync(cancellationToken);

        return car.Id;
    }
}
