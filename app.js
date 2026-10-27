//DOM reference
const form = document.querySelector("#form");
const fuelBox = document.querySelector("#fuelOptions");
const engineInput = document.querySelector("#engines");
const engineError = document.querySelector("#enginesError");
const addonBox = document.querySelector("#addonOptions");
const summaryPara = document.querySelector("#summary");
const pricePara = document.querySelector("#price");

init();

function init() {
  renderFuelOptions();
  renderAddonOptions();
  renderQuote();
}

// Fill fuels cards from data.js
function renderFuelOptions() {
  for (const fuel of fuels) {
    const label = document.createElement("label");
    label.className = "opt";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "fuel";
    input.value = fuel.id;
    if (fuel.default) {
      input.checked = true;
    }

    const labelText = `${fuel.name} · €${fuel.pricePerEngine.toLocaleString("en-US")} / engine`;
    label.append(input);
    label.append(labelText);
    fuelBox.append(label);
  }
}

// Fill addon cards from data.js
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
  renderQuote();
});

form.addEventListener("change", (e) => {
  e.preventDefault();
  renderQuote();
});

// Render on every change
function renderQuote() {
  engineError.textContent = "";
  summaryPara.textContent = "";
  pricePara.textContent = "";

  let hasError = false;

  syncAddonCheckbox(form.elements.fuel.value); //automatically gives the checked one
  const { vessel, fuel, enginesRaw, selectedAddons } = readState();

  const engineCheck = validateEngines(enginesRaw, vessel);
  if (!engineCheck.ok) {
    engineError.textContent = engineCheck.message;
    hasError = true;
  }

  const fuelId = form.elements.fuel.value;
  const addonCheck = validateAddons(selectedAddons, fuelId);
  if (!addonCheck.ok) {
    hasError = true;
  }

  if (hasError) return;

  const totalPrice = calculatePrice(
    engineCheck.count,
    fuel.pricePerEngine,
    selectedAddons,
  );

  summaryPara.textContent = `Summary: ${vessel.name} · ${fuel.name} · ${engineCheck.count} engine(s) · ${selectedAddons.map((addon) => addon.name).join(", ")}`;
  pricePara.textContent = `Total: €${totalPrice.toLocaleString("en-US")}`;
}

// Read state
function readState() {
  const vesselId = form.elements.vessel.value;
  const fuelId = form.elements.fuel.value;
  const addonInputLists = form.querySelectorAll('input[name="addon"]');

  const vessel = findById(vessels, vesselId);
  const fuel = findById(fuels, fuelId);
  const enginesRaw = engineInput.value.trim();
  const selectedAddons = [];

  for (const el of addonInputLists) {
    if (el.checked) {
      const addon = findById(addons, el.value);
      selectedAddons.push(addon);
    }
  }

  return { vessel, fuel, enginesRaw, selectedAddons };
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

function calculatePrice(engineCount, fuelPrice, selectedAddons) {
  let addonCost = 0;

  for (const addon of selectedAddons) {
    addonCost += addon.price;
  }

  return engineCount * fuelPrice + addonCost;
}
