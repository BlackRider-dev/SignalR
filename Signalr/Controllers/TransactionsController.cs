using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Signalr.Data;
using Signalr.Models;

namespace Signalr.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetRecent()
    {
        var transactions = await dbContext.CalculationTransactions
            .OrderByDescending(t => t.CalculatedAtUtc)
            .Take(25)
            .ToListAsync();

        return Ok(transactions);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTransactionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Expression))
        {
            return BadRequest("Expression is required.");
        }

        var transaction = new CalculationTransaction
        {
            Expression = request.Expression.Trim(),
            Result = request.Result,
            CalculatedAtUtc = DateTime.UtcNow
        };

        dbContext.CalculationTransactions.Add(transaction);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRecent), new { id = transaction.Id }, transaction);
    }

    public sealed class CreateTransactionRequest
    {
        public string Expression { get; set; } = string.Empty;
        public decimal Result { get; set; }
    }
}
