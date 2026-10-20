using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Cars.Commands;

public record DeleteCarCommand(Guid Id) : IRequest<Unit>;

public class DeleteCarCommandHandler : IRequestHandler<DeleteCarCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IFileStorageService _fileStorageService;

    public DeleteCarCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _fileStorageService = fileStorageService;
    }

    public async Task<Unit> Handle(DeleteCarCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            throw new UnauthorizedException();
        }

        var car = await _context.Cars
            .Include(c => c.Images)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (car == null)
        {
            throw new NotFoundException("Car", request.Id);
        }

        var isAdmin = _currentUserService.Role == UserRole.Admin.ToString();
        if (car.UserId != _currentUserService.UserId.Value && !isAdmin)
        {
            throw new ForbiddenException();
        }

        foreach (var img in car.Images)
        {
            await _fileStorageService.DeleteFileAsync(img.ImageUrl, cancellationToken);
        }

        _context.Cars.Remove(car);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
