var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Register handler
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapGet("/api/health", () => "ok");

app.Run();