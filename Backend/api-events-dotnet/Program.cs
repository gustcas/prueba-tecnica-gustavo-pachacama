using ApiEvents.Domain;
using ApiEvents.Infrastructure;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "API Eventos", Version = "v1" });
});

var mongoSettings = builder.Configuration.GetSection("Mongo").Get<MongoSettings>() ?? new MongoSettings();
builder.Services.AddSingleton(mongoSettings);
builder.Services.AddSingleton<EventRepository>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.MapPost("/events", async (EventRepository repo, SystemEventRequest request) =>
{
    var systemEvent = new SystemEvent
    {
        Type = request.Type,
        Payload = request.Payload ?? new Dictionary<string, object>(),
        OccurredAt = request.OccurredAt ?? DateTime.UtcNow
    };

    await repo.InsertAsync(systemEvent);
    return Results.Ok(new { ok = true });
});

app.MapGet("/events", async (EventRepository repo, string? type, DateTime? from, DateTime? to) =>
{
    var items = await repo.GetAsync(type, from, to);
    return Results.Ok(items);
});

app.MapGet("/events/user/{id}/logins", async (EventRepository repo, string id) =>
{
    var items = await repo.GetUserLoginsAsync(id);
    return Results.Ok(items);
});

app.MapGet("/events/login-failures/summary", async (EventRepository repo) =>
{
    var summary = await repo.GetLoginFailuresSummaryAsync();
    return Results.Ok(summary);
});

app.Run();

record SystemEventRequest(string Type, Dictionary<string, object>? Payload, DateTime? OccurredAt);
