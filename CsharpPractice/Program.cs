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
        Console.WriteLine("Engines must be 1-4");
        return 0;
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
Console.WriteLine(EnginePrice(pricePerEngine, 5));
Console.WriteLine(addonTotal);
Console.WriteLine(addonTotalTwo);

static bool ScrubberAllowed(string fuel)
{
    return fuel == "Diesel";
}
Console.WriteLine(ScrubberAllowed("LNG"));      // False
Console.WriteLine(ScrubberAllowed("Diesel"));   // True

