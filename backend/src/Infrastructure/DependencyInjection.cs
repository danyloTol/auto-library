using Application.Common.Interfaces;
using Infrastructure.Persistence;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var rawConnStr = configuration.GetConnectionString("DefaultConnection") 
            ?? configuration["DATABASE_URL"]
            ?? configuration["ConnectionStrings:DefaultConnection"]
            ?? "Host=localhost;Database=autolibrary;Username=postgres;Password=postgres";

        // Support both ADO.NET format and postgresql:// URI format from NeonDB
        var connectionString = FormatConnectionString(rawConnStr);

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString, b =>
            {
                b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                b.EnableRetryOnFailure(3);
            });
        });

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();

        return services;
    }

    private static string FormatConnectionString(string input)
    {
        if (input.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
            input.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var uri = new Uri(input);
                var userInfo = uri.UserInfo.Split(':', 2);
                var builder = new NpgsqlConnectionStringBuilder
                {
                    Host = uri.Host,
                    Port = uri.Port > 0 ? uri.Port : 5432,
                    Username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "",
                    Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "",
                    Database = uri.AbsolutePath.TrimStart('/'),
                    SslMode = SslMode.Require,
                    TrustServerCertificate = true
                };
                return builder.ConnectionString;
            }
            catch
            {
                return input;
            }
        }

        return input;
    }
}
