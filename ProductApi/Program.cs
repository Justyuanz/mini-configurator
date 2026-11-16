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



app.Run();