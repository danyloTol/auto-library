using Application.Common.Interfaces;
using Application.Common.Models;
using Application.Features.Cars.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Cars.Queries;

public record GetCarsQuery(
    string? Search = null,
    string? Brand = null,
    string? Model = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    int? MinYear = null,
    int? MaxYear = null,
    FuelType? FuelType = null,
    Transmission? Transmission = null,
    string? City = null,
    string? SortBy = null, // "price_asc", "price_desc", "year_desc", "date_desc"
    int PageIndex = 1,
    int PageSize = 12
) : IRequest<PaginatedList<CarSummaryDto>>;

public class GetCarsQueryHandler : IRequestHandler<GetCarsQuery, PaginatedList<CarSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetCarsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedList<CarSummaryDto>> Handle(GetCarsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Cars
            .AsNoTracking()
            .Where(c => c.Status == CarStatus.Approved);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(c =>
                c.Brand.ToLower().Contains(search) ||
                c.Model.ToLower().Contains(search) ||
                c.Title.ToLower().Contains(search) ||
                c.City.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(request.Brand))
        {
            query = query.Where(c => c.Brand.ToLower() == request.Brand.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(request.Model))
        {
            query = query.Where(c => c.Model.ToLower().Contains(request.Model.Trim().ToLower()));
        }

        if (request.MinPrice.HasValue)
        {
            query = query.Where(c => c.Price >= request.MinPrice.Value);
        }

        if (request.MaxPrice.HasValue)
        {
            query = query.Where(c => c.Price <= request.MaxPrice.Value);
        }

        if (request.MinYear.HasValue)
        {
            query = query.Where(c => c.Year >= request.MinYear.Value);
        }

        if (request.MaxYear.HasValue)
        {
            query = query.Where(c => c.Year <= request.MaxYear.Value);
        }

        if (request.FuelType.HasValue)
        {
            query = query.Where(c => c.FuelType == request.FuelType.Value);
        }

        if (request.Transmission.HasValue)
        {
            query = query.Where(c => c.Transmission == request.Transmission.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.City))
        {
            query = query.Where(c => c.City.ToLower() == request.City.Trim().ToLower());
        }

        // Sorting
        query = request.SortBy switch
        {
            "price_asc" => query.OrderBy(c => c.Price),
            "price_desc" => query.OrderByDescending(c => c.Price),
            "year_desc" => query.OrderByDescending(c => c.Year),
            _ => query.OrderByDescending(c => c.CreatedAt)
        };

        var currentUserId = _currentUserService.UserId;

        var count = await query.CountAsync(cancellationToken);
        var cars = await query
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
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
                currentUserId.HasValue && c.Favorites.Any(f => f.UserId == currentUserId.Value),
                c.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return new PaginatedList<CarSummaryDto>(cars, count, request.PageIndex, request.PageSize);
    }
}
