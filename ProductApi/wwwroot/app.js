//DOM reference
const form = document.querySelector("#form");
const fuelBox = document.querySelector("#fuelOptions");
const engineInput = document.querySelector("#engines");
const engineError = document.querySelector("#enginesError");
const cylinderSelect = document.querySelector("#cylinders");
const addonBox = document.querySelector("#addonOptions");
const summaryList = document.querySelector("#summary");
const pricePara = document.querySelector("#price");

let fuels = [];

start();

async function loadFuels() {
  const res = await fetch("/api/fuels");
  const data = await res.json();
  return data;
}

async function start() {
  fuels = await loadFuels();
  console.log(fuels);
  init();
}

function init() {
  renderFuelOptions();
  renderCylinderOptions();
  renderAddonOptions();
  loadFromUrl();
  renderCost();
}

// Fill cards from database
function renderFuelOptions() {
  for (const fuel of fuels) {
    const label = document.createElement("label");
    label.className = "opt";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "fuel";
    input.value = fuel.id;
    if (fuel === fuels[0]) {
      input.checked = true;
    }

    const labelText = `${fuel.name} · €${fuel.pricePerEngine.toLocaleString("en-US")} / engine`;
    label.append(input);
    label.append(labelText);
    fuelBox.append(label);
  }
}

function renderCylinderOptions() {
  for (const cyl of cylinderOptions) {
    const option = document.createElement("option");
    option.value = cyl.id;
    option.textContent = cyl.name;
    if (cyl.default) {
      option.selected = true;
    }

    cylinderSelect.append(option);
  }
}

function renderAddonOptions() {
  for (const addon of addons) {
    const label = document.createElement("label");
    label.className = "opt";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "addon";
    input.value = addon.id;
    if (addon.default) {
      input.checked = true;
    }

    const labelText = `${addon.name} · €${addon.price.toLocaleString("en-US")}`;
    label.append(input);
    label.append(labelText);
    addonBox.append(label);
  }
}

// Eventlistener
form.addEventListener("submit", (e) => {
  e.preventDefault();
  renderCost();
});

form.addEventListener("change", (e) => {
  renderCost();
});

// Render on every change
function renderCost() {
  engineError.textContent = "";
  pricePara.textContent = "";

  let hasError = false;

  syncAddonCheckbox(form.elements.fuel.value); //automatically gives the checked one
  const { vessel, fuel, enginesRaw, cylinders, selectedAddons } = readState();

  const engineCheck = validateEngines(enginesRaw, vessel);
  engineInput.min = vessel.minEngines;
  if (!engineCheck.ok) {
    engineError.textContent = engineCheck.message;
    hasError = true;
  }

  const fuelId = form.elements.fuel.value;
  const addonCheck = validateAddons(selectedAddons, fuelId);
  if (!addonCheck.ok) {
    hasError = true;
  }

  saveToUrl(vessel, fuel, enginesRaw, cylinders, selectedAddons);
  if (hasError) return;

  const totalPrice = calculatePrice(
    engineCheck.count,
    fuel.pricePerEngine,
    cylinders.priceExtra,
    selectedAddons,
  );

  const output = calculateOutput(
    engineCheck.count,
    cylinders.count,
    fuel.kwPerCylinder,
  );
  renderSummary({
    vessel,
    fuel,
    engineCheck,
    cylinders,
    output,
    selectedAddons,
  });
  pricePara.textContent = `Total: €${totalPrice.toLocaleString("en-US")}`;
}

function renderSummary({
  vessel,
  fuel,
  engineCheck,
  cylinders,
  output,
  selectedAddons,
}) {
  const summaryLines = [
    { label: "Vessel", value: vessel.name },
    { label: "Fuel", value: fuel.name },
    {
      label: "Engines",
      value: `${engineCheck.count} × ${cylinders.count} cyl`,
    },
    { label: "Output", value: `${output.toLocaleString("en-US")} kW` },
    { label: "Emission", value: fuel.tier },
  ];

  for (const addon of selectedAddons) {
    summaryLines.push({ label: "Add-on", value: addon.name });
  }

  summaryList.replaceChildren();

  for (const line of summaryLines) {
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = line.label;

    const value = document.createElement("span");
    value.textContent = line.value;

    li.append(label, value);
    summaryList.append(li);
  }
}

// Read state
function readState() {
  const vesselId = form.elements.vessel.value;
  const fuelId = form.elements.fuel.value;
  const cylinderId = form.elements.cylinders.value;
  const addonInputLists = form.querySelectorAll('input[name="addon"]');

  const vessel = findById(vessels, vesselId);
  const fuel = findById(fuels, fuelId);
  const enginesRaw = engineInput.value.trim();
  const cylinders = findById(cylinderOptions, cylinderId);
  const selectedAddons = [];

  for (const el of addonInputLists) {
    if (el.checked) {
      const addon = findById(addons, el.value);
      selectedAddons.push(addon);
    }
  }

  return { vessel, fuel, enginesRaw, cylinders, selectedAddons };
}

// Validation rulesets
function validateEngines(raw, vessel) {
  if (raw === "") {
    return { ok: false, message: "Enter the number" };
  }

  const count = Number(raw);

  if (Number.isNaN(count)) {
    return { ok: false, message: "Engine count must be a number" };
  }
  if (!Number.isInteger(count)) {
    return { ok: false, message: "Engine count must be an integer" };
  }
  if (count < 1 || count > 4) {
    return { ok: false, message: "Engines must be 1–4." };
  }
  if (count < vessel.minEngines) {
    return {
      ok: false,
      message: `${vessel.name} needs ${vessel.minEngines} or more engines`,
    };
  }
  return { ok: true, count };
}

function validateAddons(selectedAddons, fuelId) {
  for (const addon of selectedAddons) {
    if (addon.onlyFuel && addon.onlyFuel !== fuelId) {
      return {
        ok: false,
      };
    }
  }
  return { ok: true };
}

function saveToUrl(vessel, fuel, enginesRaw, cylinders, selectedAddons) {
  const params = new URLSearchParams();

  params.set("vessel", vessel.id);
  params.set("fuel", fuel.id);
  params.set("engines", enginesRaw);
  params.set("cylinders", cylinders.id);
  for (const addon of selectedAddons) {
    params.append("addon", addon.id);
  }

  history.replaceState(null, "", "?" + params);
}

function loadFromUrl() {
  const paramsFromUrl = new URLSearchParams(location.search);
  const vesselID = paramsFromUrl.get("vessel");
  const fuelID = paramsFromUrl.get("fuel");
  const engineID = paramsFromUrl.get("engines");
  const cylinderID = paramsFromUrl.get("cylinders");

  if (findById(vessels, vesselID)) {
    form.elements.vessel.value = vesselID;
  }
  if (findById(fuels, fuelID)) {
    form.elements.fuel.value = fuelID;
  }
  if (engineID) {
    form.elements.engines.value = engineID;
  }
  if (findById(cylinderOptions, cylinderID)) {
    form.elements.cylinders.value = cylinderID;
  }

  const addonIds = paramsFromUrl.getAll("addon");
  const addonInputs = form.querySelectorAll('input[name="addon"]');

  for (const el of addonInputs) {
    if (addonIds.includes(el.value)) {
      el.checked = true;
    } else {
      el.checked = false;
    }
  }
}

// Helpers
function findById(list, id) {
  return list.find((item) => item.id === id);
}

function syncAddonCheckbox(fuelId) {
  const addonCheckboxes = form.querySelectorAll('input[name="addon"]');

  addonCheckboxes.forEach((el) => {
    let allowed = false;
    const addon = findById(addons, el.value);
    if (!addon.onlyFuel || addon.onlyFuel === fuelId) {
      allowed = true;
    }
    if (!allowed) {
      el.disabled = true;
      el.checked = false;
    } else {
      el.disabled = false;
    }
  });
}

function calculateOutput(engineCount, cylinderCount, kwPerCylinder) {
  return engineCount * cylinderCount * kwPerCylinder;
}

function calculatePrice(
  engineCount,
  fuelPrice,
  cylindersPrice,
  selectedAddons,
) {
  let addonCost = 0;

  for (const addon of selectedAddons) {
    addonCost += addon.price;
  }

  return engineCount * (fuelPrice + cylindersPrice) + addonCost;
}
