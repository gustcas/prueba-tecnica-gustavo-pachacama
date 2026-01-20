namespace ApiEvents.Domain;

public class SystemEvent
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Type { get; set; } = string.Empty;
    public Dictionary<string, object> Payload { get; set; } = new();
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
}
