using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Cars.DTOs;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Favorites;

public record ToggleFavoriteCommand(Guid CarId) : IRequest<bool>;

public class ToggleFavoriteCommandHandler : IRequestHandler<ToggleFavoriteCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ToggleFavoriteCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(ToggleFavoriteCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            throw new UnauthorizedException();
        }

        var userId = _currentUserService.UserId.Value;

        var carExists = await _context.Cars.AnyAsync(c => c.Id == request.CarId, cancellationToken);
        if (!carExists)
        {
            throw new NotFoundException("Car", request.CarId);
        }

        var existing = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.CarId == request.CarId, cancellationToken);

        if (existing != null)
        {
            _context.Favorites.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return false;
        }

        var favorite = new Favorite
        {
            UserId = userId,
            CarId = request.CarId
        };

        _context.Favorites.Add(favorite);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record GetUserFavoritesQuery : IRequest<List<CarSummaryDto>>;

public class GetUserFavoritesQueryHandler : IRequestHandler<GetUserFavoritesQuery, List<CarSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetUserFavoritesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<CarSummaryDto>> Handle(GetUserFavoritesQuery request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            throw new UnauthorizedException();
        }

        var userId = _currentUserService.UserId.Value;

        var cars = await _context.Favorites
            .AsNoTracking()
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => f.Car)
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
                true,
                c.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return cars;
    }
}
