# Use .NET 9.0 SDK for build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy project file and restore dependencies
COPY Backend/*.csproj ./Backend/
RUN dotnet restore ./Backend/Backend.csproj

# Copy the entire Backend folder
COPY Backend/ ./Backend/

# Publish the app
WORKDIR /app/Backend
RUN dotnet publish Backend.csproj -c Release -o /app/publish

# Build runtime image with ASP.NET
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# Run the application
ENTRYPOINT ["dotnet", "Backend.dll"]
