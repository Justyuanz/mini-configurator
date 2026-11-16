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

// global
let fuels = [];
let addons = [];
let allowedAddons = [];

async function loadFuels() {
  const res = await fetch("/api/fuels");
  const data = await res.json();
  return data;
}

async function loadAddons() {
  const res = await fetch("/api/addons");
  const data = await res.json();
  return data;
}

async function loadAllowedAddons(fuelId) {
  const res = await fetch(`/api/addons?fuel=${fuelId}`);
  const data = await res.json();
  const allowedAddonIds = [];

  data.forEach((addon) => {
    allowedAddonIds.push(addon.id);
  });
  return allowedAddonIds;
}
