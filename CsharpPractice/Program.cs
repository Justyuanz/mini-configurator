string fuel = "Diesel";
decimal pricePerEngine = 400000m;
int engines = 2;
bool hasScrubber = true;
decimal[] addonPrices = { 250000m, 180000m, 40000};

Console.WriteLine($"{fuel}: {pricePerEngine} x {engines}, scrubber {hasScrubber}");

static decimal EnginePrice(decimal pricePerEngine, int count)
{
    if (count < 1 || count > 4)
    {
        throw new ArgumentException("Engines must be 1-4.");
    }
    return pricePerEngine * count;
}

decimal addonTotal = 0;
for(int i = 0 ; i < addonPrices.Length; i++)
{
    addonTotal += addonPrices[i];
}

decimal addonTotalTwo = 0;
foreach(decimal price in addonPrices)
{
    addonTotalTwo += price;
}

Console.WriteLine(EnginePrice(520000m, 4));
Console.WriteLine(addonTotal);
Console.WriteLine(addonTotalTwo);

static bool ScrubberAllowed(string fuel)
{
    return fuel == "Diesel";
}
Console.WriteLine(ScrubberAllowed("LNG"));      // False
Console.WriteLine(ScrubberAllowed("Diesel"));   // True

Console.WriteLine(new Fuel("lng", "hi", 40000m));

List<Fuel> fuels =
[
    new Fuel("diesel", "Diesel", 400000m),
    new Fuel("lng", "LNG", 520000m),
    new Fuel("methanol", "Methanol", 560000m),
];

List<Addon> addons =
[
    new Addon("hybrid", "Battery hybrid", 250000m, null),
    new Addon("scrubber", "Exhaust scrubber", 180000m, "diesel"),
    new Addon("monitoring", "Remote monitoring", 40000m, null),
];

Fuel? lng = fuels.FirstOrDefault(f => f.Id == "lng");
Console.WriteLine($"hi: {lng?.Name} {lng?.GetType()}");

Fuel? none = fuels.Find(item => item.Name == "banana");
Console.WriteLine(none is null);

static List<Addon> AllowedAddons(List<Addon> addons, string fuelId)
{
    return addons
        .Where(a => a.OnlyFuel == null || a.OnlyFuel == fuelId)
        .ToList();
}

foreach (var addon in AllowedAddons(addons, "diesel"))
{
    Console.WriteLine(addon.Name);
}

List<string> names = addons.Select(a => a.Name).ToList();
foreach (var name in names)
{
    Console.WriteLine($"name: {name}");
}

decimal addonsTotal = addons.Sum(a => a.Price);
Console.WriteLine($"sum: {addonsTotal}");


try
{
    Console.WriteLine(EnginePrice(400000m, 5));
}
catch (ArgumentException ex)
{
    Console.WriteLine($"Error: {ex.Message}");
}

record Fuel(string Id, string Name, decimal Price);
record Addon(string Id, string Name, decimal Price, string? OnlyFuel);
