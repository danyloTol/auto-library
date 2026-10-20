using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Cars.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Cars.Queries;

public record GetCarByIdQuery(Guid Id) : IRequest<CarDetailsDto>;

public class GetCarByIdQueryHandler : IRequestHandler<GetCarByIdQuery, CarDetailsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetCarByIdQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<CarDetailsDto> Handle(GetCarByIdQuery request, CancellationToken cancellationToken)
    {
        var car = await _context.Cars
            .AsNoTracking()
            .Include(c => c.User)
            .Include(c => c.Images)
            .Include(c => c.Reviews)
            .Include(c => c.Favorites)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (car == null)
        {
            throw new NotFoundException("Car", request.Id);
        }

        var isOwner = _currentUserService.UserId == car.UserId;
        var isAdmin = _currentUserService.Role == UserRole.Admin.ToString();

        // If car is not approved, only owner or admin can view
        if (car.Status != CarStatus.Approved && !isOwner && !isAdmin)
        {
            throw new NotFoundException("Car", request.Id);
        }

        var currentUserId = _currentUserService.UserId;

        return new CarDetailsDto(
            car.Id,
            car.Title,
            car.Brand,
            car.Model,
            car.Year,
            car.Price,
            car.Mileage,
            car.FuelType,
            car.Transmission,
            car.EngineCapacity,
            car.Description,
            car.City,
            car.Status,
            car.RejectionReason,
            new SellerDto(car.User.Id, car.User.FullName, car.User.PhoneNumber, car.User.Email),
            car.Images.Select(img => new CarImageDto(img.Id, img.ImageUrl, img.IsPrimary)).ToList(),
            car.Favorites.Count,
            car.Reviews.Any() ? car.Reviews.Average(r => (double)r.Rating) : 0,
            car.Reviews.Count,
            currentUserId.HasValue && car.Favorites.Any(f => f.UserId == currentUserId.Value),
            car.CreatedAt,
            car.UpdatedAt
        );
    }
}
