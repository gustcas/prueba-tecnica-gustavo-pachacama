using ApiEvents.Domain;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ApiEvents.Infrastructure;

public class EventRepository
{
    private readonly IMongoCollection<SystemEvent> _collection;

    public EventRepository(MongoSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.Database);
        _collection = database.GetCollection<SystemEvent>(settings.Collection);
    }

    public Task InsertAsync(SystemEvent systemEvent)
    {
        return _collection.InsertOneAsync(systemEvent);
    }

    public async Task<List<SystemEvent>> GetAsync(string? type, DateTime? from, DateTime? to)
    {
        var filter = Builders<SystemEvent>.Filter.Empty;

        if (!string.IsNullOrWhiteSpace(type))
        {
            filter &= Builders<SystemEvent>.Filter.Eq(x => x.Type, type);
        }

        if (from.HasValue)
        {
            filter &= Builders<SystemEvent>.Filter.Gte(x => x.OccurredAt, from.Value);
        }

        if (to.HasValue)
        {
            filter &= Builders<SystemEvent>.Filter.Lte(x => x.OccurredAt, to.Value);
        }

        return await _collection.Find(filter).SortByDescending(x => x.OccurredAt).ToListAsync();
    }

    public async Task<List<SystemEvent>> GetUserLoginsAsync(string userId)
    {
        var filter = Builders<SystemEvent>.Filter.Eq("Payload.userId", userId);
        return await _collection.Find(filter).SortByDescending(x => x.OccurredAt).ToListAsync();
    }

    public async Task<List<BsonDocument>> GetLoginFailuresSummaryAsync()
    {
        var pipeline = new[]
        {
            new BsonDocument("$match", new BsonDocument("Type", "user.login.failed")),
            new BsonDocument("$group", new BsonDocument
            {
                { "_id", "$Payload.userId" },
                { "count", new BsonDocument("$sum", 1) }
            })
        };

        return await _collection.Aggregate<BsonDocument>(pipeline).ToListAsync();
    }
}
