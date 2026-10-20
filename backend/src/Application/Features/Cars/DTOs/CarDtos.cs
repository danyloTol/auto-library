using Domain.Enums;

namespace Application.Features.Cars.DTOs;

public record CarImageDto(
    Guid Id,
    string ImageUrl,
    bool IsPrimary
);

public record SellerDto(
    Guid Id,
    string FullName,
    string? PhoneNumber,
    string Email
);

public record CarSummaryDto(
    Guid Id,
    string Title,
    string Brand,
    string Model,
    int Year,
    decimal Price,
    int Mileage,
    FuelType FuelType,
    Transmission Transmission,
    string City,
    string? PrimaryImageUrl,
    CarStatus Status,
    string? RejectionReason,
    int FavoritesCount,
    double AverageRating,
    int ReviewsCount,
    bool IsFavorite,
    DateTime CreatedAt
);

public record CarDetailsDto(
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
    string City,
    CarStatus Status,
    string? RejectionReason,
    SellerDto Seller,
    IReadOnlyCollection<CarImageDto> Images,
    int FavoritesCount,
    double AverageRating,
    int ReviewsCount,
    bool IsFavorite,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreateCarRequest(
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
);

public record UpdateCarRequest(
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
);
