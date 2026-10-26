const vessels = [
  { id: "ferry", name: "Ferry", minEngines: 1 },
  { id: "cargo", name: "Cargo", minEngines: 1 },
  { id: "cruise", name: "Cruise", minEngines: 2 },
];
const fuels = [
  { id: "diesel", name: "Diesel", pricePerEngine: 400000, default: true },
  { id: "lng", name: "LNG", pricePerEngine: 520000 },
  { id: "methanol", name: "Methanol", pricePerEngine: 560000 },
];
const addons = [
  { id: "hybrid", name: "Battery hybrid", price: 250000 },
  {
    id: "scrubber",
    name: "Exhaust scrubber",
    price: 180000,
    onlyFuel: "diesel",
    default: true,
  },
  { id: "monitoring", name: "Remote monitoring", price: 40000 },
];
