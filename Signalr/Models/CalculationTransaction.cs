namespace Signalr.Models;

public class CalculationTransaction
{
    public int Id { get; set; }
    public string Expression { get; set; } = string.Empty;
    public decimal Result { get; set; }
    public DateTime CalculatedAtUtc { get; set; } = DateTime.UtcNow;
}
