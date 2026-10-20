# ==========================================
# 1. BUILD FRONTEND (React + Vite + Tailwind)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# 2. BUILD BACKEND (.NET 9 Clean Architecture)
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-builder
WORKDIR /app

# Copy solution and project files for caching restore
COPY backend/*.sln* ./
COPY backend/src/Domain/*.csproj ./src/Domain/
COPY backend/src/Application/*.csproj ./src/Application/
COPY backend/src/Infrastructure/*.csproj ./src/Infrastructure/
COPY backend/src/WebApi/*.csproj ./src/WebApi/

RUN dotnet restore src/WebApi/WebApi.csproj

# Copy source and publish
COPY backend/src/ ./src/
WORKDIR /app/src/WebApi
RUN dotnet publish -c Release -o /app/publish

# ==========================================
# 3. FINAL ALL-IN-ONE RUNTIME CONTAINER
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copy published .NET 9 API
COPY --from=backend-builder /app/publish ./

# Copy compiled React Frontend directly into wwwroot
COPY --from=frontend-builder /frontend/dist ./wwwroot

# Ensure uploads directory exists
RUN mkdir -p /app/wwwroot/uploads

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "WebApi.dll"]
