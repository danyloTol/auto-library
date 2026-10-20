using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Reviews;

public record ReviewDto(
    Guid Id,
    Guid UserId,
    string UserName,
    int Rating,
    string Comment,
    DateTime CreatedAt
);

public record AddReviewCommand(
    Guid CarId,
    int Rating,
    string Comment
) : IRequest<ReviewDto>;

public class AddReviewCommandValidator : AbstractValidator<AddReviewCommand>
{
    public AddReviewCommandValidator()
    {
        RuleFor(x => x.Rating).InclusiveBetween(1, 5);
        RuleFor(x => x.Comment).NotEmpty().MaximumLength(1000);
    }
}

public class AddReviewCommandHandler : IRequestHandler<AddReviewCommand, ReviewDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AddReviewCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ReviewDto> Handle(AddReviewCommand request, CancellationToken cancellationToken)
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

        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null)
        {
            throw new UnauthorizedException();
        }

        var review = new Review
        {
            CarId = request.CarId,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment.Trim()
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync(cancellationToken);

        return new ReviewDto(review.Id, user.Id, user.FullName, review.Rating, review.Comment, review.CreatedAt);
    }
}

public record GetCarReviewsQuery(Guid CarId) : IRequest<List<ReviewDto>>;

public class GetCarReviewsQueryHandler : IRequestHandler<GetCarReviewsQuery, List<ReviewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCarReviewsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReviewDto>> Handle(GetCarReviewsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Reviews
            .AsNoTracking()
            .Where(r => r.CarId == request.CarId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto(
                r.Id,
                r.UserId,
                r.User.FullName,
                r.Rating,
                r.Comment,
                r.CreatedAt
            ))
            .ToListAsync(cancellationToken);
    }
}
