using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Cars.DTOs;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Cars.Commands;

public record FileUploadModel(Stream Stream, string FileName);

public record UploadCarImagesCommand(
    Guid CarId,
    List<FileUploadModel> Files
) : IRequest<List<CarImageDto>>;

public class UploadCarImagesCommandHandler : IRequestHandler<UploadCarImagesCommand, List<CarImageDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IFileStorageService _fileStorageService;

    public UploadCarImagesCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _fileStorageService = fileStorageService;
    }

    public async Task<List<CarImageDto>> Handle(UploadCarImagesCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            throw new UnauthorizedException();
        }

        var car = await _context.Cars
            .Include(c => c.Images)
            .FirstOrDefaultAsync(c => c.Id == request.CarId, cancellationToken);

        if (car == null)
        {
            throw new NotFoundException("Car", request.CarId);
        }

        var isAdmin = _currentUserService.Role == UserRole.Admin.ToString();
        if (car.UserId != _currentUserService.UserId.Value && !isAdmin)
        {
            throw new ForbiddenException();
        }

        var hasPrimary = car.Images.Any(i => i.IsPrimary);
        var result = new List<CarImageDto>();

        foreach (var file in request.Files)
        {
            var relativePath = await _fileStorageService.SaveFileAsync(file.Stream, file.FileName, "cars", cancellationToken);
            var isPrimary = !hasPrimary;
            if (isPrimary) hasPrimary = true;

            var image = new CarImage
            {
                CarId = car.Id,
                ImageUrl = relativePath,
                IsPrimary = isPrimary
            };

            _context.CarImages.Add(image);
            result.Add(new CarImageDto(image.Id, image.ImageUrl, image.IsPrimary));
        }

        await _context.SaveChangesAsync(cancellationToken);
        return result;
    }
}
