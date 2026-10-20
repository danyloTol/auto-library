using Domain.Enums;

namespace Application.Features.Auth.DTOs;

public record UserDto(
    Guid Id,
    string Email,
    string FullName,
    string? PhoneNumber,
    UserRole Role,
    DateTime CreatedAt
);

public record AuthResponseDto(
    string Token,
    UserDto User
);

public record RegisterRequestDto(
    string Email,
    string Password,
    string FullName,
    string? PhoneNumber
);

public record LoginRequestDto(
    string Email,
    string Password
);
