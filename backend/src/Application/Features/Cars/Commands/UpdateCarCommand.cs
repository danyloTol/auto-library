using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Cars.Commands;

public record UpdateCarCommand(
    Guid Id,
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
) : IRequest<Unit>;

public class UpdateCarCommandValidator : AbstractValidator<UpdateCarCommand>
{
    public UpdateCarCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Brand).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Model).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Year).InclusiveBetween(1900, DateTime.UtcNow.Year + 1);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.Mileage).GreaterThanOrEqualTo(0);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
    }
}

public class UpdateCarCommandHandler : IRequestHandler<UpdateCarCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCarCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(UpdateCarCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            throw new UnauthorizedException();
        }

        var car = await _context.Cars.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (car == null)
        {
            throw new NotFoundException("Car", request.Id);
        }

        var isAdmin = _currentUserService.Role == UserRole.Admin.ToString();
        if (car.UserId != _currentUserService.UserId.Value && !isAdmin)
        {
            throw new ForbiddenException();
        }

        car.Title = request.Title.Trim();
        car.Brand = request.Brand.Trim();
        car.Model = request.Model.Trim();
        car.Year = request.Year;
        car.Price = request.Price;
        car.Mileage = request.Mileage;
        car.FuelType = request.FuelType;
        car.Transmission = request.Transmission;
        car.EngineCapacity = request.EngineCapacity;
        car.Description = request.Description.Trim();
        car.City = request.City.Trim();
        car.UpdatedAt = DateTime.UtcNow;

        // If user changed critical details, revert to pending moderation
        if (!isAdmin)
        {
            car.Status = CarStatus.Pending;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
