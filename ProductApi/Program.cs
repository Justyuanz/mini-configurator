using MySqlConnector;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

string connString = builder.Configuration.GetConnectionString("Harbor") // Shared by every request and every thread. Read only.
    ?? throw new Exception("Harbor connection string is missing");

// Register handler
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapGet("/api/health", () => "ok");

// INSIDE a handler = fresh locals per request, so no sharing between threads.
app.MapGet("/api/fuels", async () =>
{
    await using var connection = new MySqlConnection(connString);
    await connection.OpenAsync();

    using var command = new MySqlCommand();
    command.Connection = connection;
    command.CommandText = """
    SELECT id, name, price, kw_per_cylinder, tier
    FROM products
    WHERE kind = 'fuel'
    ORDER BY price
    """;

    await using var reader = await command.ExecuteReaderAsync();

    var fuels = new List<object>();

    while (await reader.ReadAsync())
    {
        fuels.Add(new
        {
            id = reader.GetString(reader.GetOrdinal("id")),
            name = reader.GetString(reader.GetOrdinal("name")),
            pricePerEngine = reader.GetDecimal(reader.GetOrdinal("price")),
            kwPerCylinder = reader.GetInt32(reader.GetOrdinal("kw_per_cylinder")),
            tier = reader.GetString(reader.GetOrdinal("tier")),
        });
    }

    return fuels;
});

app.MapGet("/api/vessels", async () =>
{
    await using var connection = new MySqlConnection(connString);
    await connection.OpenAsync();

    using var command = new MySqlCommand();
    command.Connection = connection;
    command.CommandText = """
    SELECT id, name, min_engines
    FROM vessels
    ORDER BY name
    """;

    await using var reader = await command.ExecuteReaderAsync();

    var vessels = new List<object>();

    while (await reader.ReadAsync())
    {
        vessels.Add(new
        {
            id         = reader.GetString(reader.GetOrdinal("id")),
            name       = reader.GetString(reader.GetOrdinal("name")),
            minEngines = reader.GetInt32(reader.GetOrdinal("min_engines")),
        });
    }

    return vessels;
});

app.MapGet("/api/cylinders", async () =>
{
    await using var connection = new MySqlConnection(connString);
    await connection.OpenAsync();

    using var command = new MySqlCommand();
    command.Connection = connection;
    command.CommandText = """
    SELECT id, name, count, price_extra, is_default
    FROM cylinder_options
    ORDER BY count
    """;

    await using var reader = await command.ExecuteReaderAsync();

    var cylinders = new List<object>();

    while (await reader.ReadAsync())
    {
        cylinders.Add(new
        {
            id         = reader.GetString(reader.GetOrdinal("id")),
            name       = reader.GetString(reader.GetOrdinal("name")),
            count      = reader.GetInt32(reader.GetOrdinal("count")),
            priceExtra = reader.GetDecimal(reader.GetOrdinal("price_extra")),
            @default   = reader.GetBoolean(reader.GetOrdinal("is_default")),
        });
    }

    return cylinders;
});

app.MapGet("/api/addons", async (string? fuel) =>
{
    await using var connection = new MySqlConnection(connString);
    await connection.OpenAsync();

    using var command = new MySqlCommand();
    command.Connection = connection;
    if (fuel == null)
    {
        command.CommandText = """
        SELECT id, name, price
        FROM products
        WHERE kind = 'addon'
        ORDER BY price
        """;
    }
    else
    {
        command.CommandText = """
        SELECT p.id, p.name, p.price
        FROM products p
        INNER JOIN addon_fuels af ON af.addon_id = p.id
        WHERE af.fuel_id = @fuelId
        """;
        command.Parameters.AddWithValue("@fuelId", fuel);
    }

    await using var reader = await command.ExecuteReaderAsync();

    var addons = new List<object>();

    while (await reader.ReadAsync())
    {
        addons.Add(new
        {
            id = reader.GetString(reader.GetOrdinal("id")),
            name = reader.GetString(reader.GetOrdinal("name")),
            price = reader.GetDecimal(reader.GetOrdinal("price")),
        });
    }

    return addons;
});

app.MapPost("/api/quote", async (QuoteRequest req) =>
{
    if (req.Engines < 1 || req.Engines > 4)
        return Results.BadRequest(new { error = "engines must be 1-4" });

    await using var connection = new MySqlConnection(connString);
    await connection.OpenAsync();

    using var command = new MySqlCommand();
    command.Connection = connection;
    // Price
    command.CommandText = """
    SELECT price FROM products
    WHERE kind = 'fuel' AND id = @fuelId
    """;
    command.Parameters.AddWithValue("@fuelId", req.FuelId);

    var result = await command.ExecuteScalarAsync();
    if (result == null)
        return Results.BadRequest(new { error = "unknown fuel" });
    decimal fuelPrice = (decimal)result;

    // Vessel
    command.CommandText = "SELECT min_engines FROM vessels WHERE id = @vesselId";
    command.Parameters.AddWithValue("@vesselId", req.VesselId);

    var minResult = await command.ExecuteScalarAsync();
    if (minResult == null)
        return Results.BadRequest(new { error = "unknown vessel" });

    int minEngines = (int)minResult;
    if (req.Engines < minEngines)
        return Results.BadRequest(new { error = $"this vessel needs at least {minEngines} engines" });

    // Cylinders
    command.CommandText = "SELECT price_extra FROM cylinder_options WHERE id = @cylinderId";
    command.Parameters.AddWithValue("@cylinderId", req.CylinderId);

    var cylResult = await command.ExecuteScalarAsync();
    if (cylResult == null)
        return Results.BadRequest(new { error = "unknown cylinders" });

    decimal cylinderPrice = (decimal)cylResult;

    // Addon
    command.CommandText = """
    SELECT p.id, p.price
    FROM products p
    INNER JOIN addon_fuels af ON af.addon_id = p.id
    WHERE af.fuel_id = @fuelId
    """;

    var allowedAddons = new Dictionary<string, decimal>();
    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        string addonId = reader.GetString(reader.GetOrdinal("id"));
        decimal addonPrice = reader.GetDecimal(reader.GetOrdinal("price"));
        allowedAddons.Add(addonId, addonPrice);
    }
    decimal total = (fuelPrice + cylinderPrice) * req.Engines;

    string[] addonIds = req.Addons ?? [];
    foreach (string addonId in addonIds)
    {
        if (!allowedAddons.TryGetValue(addonId, out decimal addonPrice))
            return Results.BadRequest(new { error = $"addon not allowed: {addonId}" });
        total += addonPrice;
    }

    return Results.Ok(new { total });
});

app.Run();

// The shape of the JSON that POSTs to /api/quote.
record QuoteRequest(string VesselId, string FuelId, int Engines, string CylinderId, string[]? Addons);
