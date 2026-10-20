using System.Net;
using System.Text.Json;
using Application.Common.Exceptions;
using FluentValidation;

namespace WebApi.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = HttpStatusCode.InternalServerError;
        var message = "Внутрішня помилка сервера. Спробуйте пізніше.";
        object? errors = null;

        switch (exception)
        {
            case NotFoundException notFound:
                statusCode = HttpStatusCode.NotFound;
                message = notFound.Message;
                break;

            case BadRequestException badRequest:
                statusCode = HttpStatusCode.BadRequest;
                message = badRequest.Message;
                break;

            case UnauthorizedException unauthorized:
                statusCode = HttpStatusCode.Unauthorized;
                message = unauthorized.Message;
                break;

            case ForbiddenException forbidden:
                statusCode = HttpStatusCode.Forbidden;
                message = forbidden.Message;
                break;

            case ValidationException validationException:
                statusCode = HttpStatusCode.BadRequest;
                message = "Помилка валідації введених даних.";
                errors = validationException.Errors.Select(e => new { Field = e.PropertyName, Error = e.ErrorMessage });
                break;
        }

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            StatusCode = (int)statusCode,
            Message = message,
            Errors = errors
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
