using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Cars.DTOs;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admin;

public record GetPendingCarsQuery : IRequest<List<CarDetailsDto>>;

public class GetPendingCarsQueryHandler : IRequestHandler<GetPendingCarsQuery, List<CarDetailsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetPendingCarsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<CarDetailsDto>> Handle(GetPendingCarsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUserService.Role != UserRole.Admin.ToString())
        {
            throw new ForbiddenException();
        }

        var cars = await _context.Cars
            .AsNoTracking()
            .Where(c => c.Status == CarStatus.Pending)
            .Include(c => c.User)
            .Include(c => c.Images)
            .Include(c => c.Reviews)
            .Include(c => c.Favorites)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        return cars.Select(c => new CarDetailsDto(
            c.Id,
            c.Title,
            c.Brand,
            c.Model,
            c.Year,
            c.Price,
            c.Mileage,
            c.FuelType,
            c.Transmission,
            c.EngineCapacity,
            c.Description,
            c.City,
            c.Status,
            c.RejectionReason,
            new SellerDto(c.User.Id, c.User.FullName, c.User.PhoneNumber, c.User.Email),
            c.Images.Select(img => new CarImageDto(img.Id, img.ImageUrl, img.IsPrimary)).ToList(),
            c.Favorites.Count,
            c.Reviews.Any() ? c.Reviews.Average(r => (double)r.Rating) : 0,
            c.Reviews.Count,
            false,
            c.CreatedAt,
            c.UpdatedAt
        )).ToList();
    }
}

public record ApproveCarCommand(Guid Id) : IRequest<Unit>;

public class ApproveCarCommandHandler : IRequestHandler<ApproveCarCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ApproveCarCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(ApproveCarCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.Role != UserRole.Admin.ToString())
        {
            throw new ForbiddenException();
        }

        var car = await _context.Cars.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (car == null)
        {
            throw new NotFoundException("Car", request.Id);
        }

        car.Status = CarStatus.Approved;
        car.RejectionReason = null;
        car.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}

public record RejectCarCommand(Guid Id, string Reason) : IRequest<Unit>;

public class RejectCarCommandValidator : AbstractValidator<RejectCarCommand>
{
    public RejectCarCommandValidator()
    {
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(1000);
    }
}

public class RejectCarCommandHandler : IRequestHandler<RejectCarCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public RejectCarCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(RejectCarCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.Role != UserRole.Admin.ToString())
        {
            throw new ForbiddenException();
        }

        var car = await _context.Cars.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (car == null)
        {
            throw new NotFoundException("Car", request.Id);
        }

        car.Status = CarStatus.Rejected;
        car.RejectionReason = request.Reason.Trim();
        car.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
