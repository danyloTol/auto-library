using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Cars.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Cars.Queries;

public record GetUserCarsQuery : IRequest<List<CarSummaryDto>>;

public class GetUserCarsQueryHandler : IRequestHandler<GetUserCarsQuery, List<CarSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetUserCarsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<CarSummaryDto>> Handle(GetUserCarsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            throw new UnauthorizedException();
        }

        var userId = _currentUserService.UserId.Value;

        var cars = await _context.Cars
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CarSummaryDto(
                c.Id,
                c.Title,
                c.Brand,
                c.Model,
                c.Year,
                c.Price,
                c.Mileage,
                c.FuelType,
                c.Transmission,
                c.City,
                c.Images.Where(i => i.IsPrimary).Select(i => i.ImageUrl).FirstOrDefault()
                    ?? c.Images.Select(i => i.ImageUrl).FirstOrDefault(),
                c.Status,
                c.RejectionReason,
                c.Favorites.Count,
                c.Reviews.Any() ? c.Reviews.Average(r => (double)r.Rating) : 0,
                c.Reviews.Count,
                c.Favorites.Any(f => f.UserId == userId),
                c.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return cars;
    }
}
