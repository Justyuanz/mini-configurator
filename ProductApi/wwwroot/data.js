const vessels = [
  { id: "ferry", name: "Ferry", minEngines: 1 },
  { id: "cargo", name: "Cargo", minEngines: 1 },
  { id: "cruise", name: "Cruise", minEngines: 2 },
];

// priceExtra is added to each engine's price. 6 cylinders is the base, so 0.
const cylinderOptions = [
  { id: "6", name: "6 cylinders", count: 6, priceExtra: 0, default: true },
  { id: "8", name: "8 cylinders", count: 8, priceExtra: 90000 },
  { id: "9", name: "9 cylinders", count: 9, priceExtra: 140000 },
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
