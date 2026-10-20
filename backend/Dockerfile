FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy solution and project files
COPY *.sln ./
COPY src/Domain/*.csproj ./src/Domain/
COPY src/Application/*.csproj ./src/Application/
COPY src/Infrastructure/*.csproj ./src/Infrastructure/
COPY src/WebApi/*.csproj ./src/WebApi/

# Restore dependencies
RUN dotnet restore src/WebApi/WebApi.csproj

# Copy the rest of the source code
COPY src/ ./src/

# Publish
WORKDIR /app/src/WebApi
RUN dotnet publish -c Release -o /out

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /out ./

# Create directory for uploads
RUN mkdir -p /app/wwwroot/uploads

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "WebApi.dll"]
