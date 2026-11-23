// global
let fuels = [];
let addons = [];
let allowedAddons = [];
let vessels = [];
let cylinderOptions = [];

async function loadFuels() {
  const res = await fetch("/api/fuels");
  const data = await res.json();
  return data;
}

async function loadVessels() {
  const res = await fetch("/api/vessels");
  const data = await res.json();
  return data;
}

async function loadCylinders() {
  const res = await fetch("/api/cylinders");
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

async function sendQuote(quote) {
  const res = await fetch("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote),
  });
  const data = await res.json();
  return { ok: res.ok };
}
