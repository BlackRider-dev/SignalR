using Microsoft.EntityFrameworkCore;
using Signalr.Models;

namespace Signalr.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<CalculationTransaction> CalculationTransactions => Set<CalculationTransaction>();
}
