using DbUp;
using System.Reflection;

var connectionString =
	args.Length > 0
		? args[0]
		: "Server=localhost,1433;Database=InfoFinDb;User=sa;Password=InfoFin@Passw0rd2026!;TrustServerCertificate=True;";

Console.WriteLine("Ensuring database exists...");
EnsureDatabase.For.SqlDatabase(connectionString);

var upgrader = DeployChanges.To
	.SqlDatabase(connectionString)
	.WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
	.LogToConsole()
	.Build();

Console.WriteLine("Executing migrations...");
var result = upgrader.PerformUpgrade();

if (!result.Successful)
{
	Console.ForegroundColor = ConsoleColor.Red;
	Console.WriteLine(result.Error);
	Console.ResetColor();
	return;
}

Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("Success!");
Console.ResetColor();
