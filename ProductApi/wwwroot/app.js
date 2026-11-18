//DOM reference
const form = document.querySelector("#form");
const fuelBox = document.querySelector("#fuelOptions");
const engineInput = document.querySelector("#engines");
const engineError = document.querySelector("#enginesError");
const cylinderSelect = document.querySelector("#cylinders");
const addonBox = document.querySelector("#addonOptions");
const summaryList = document.querySelector("#summary");
const pricePara = document.querySelector("#price");

start();

async function start() {
  fuels = await loadFuels();
  addons = await loadAddons();
  vessels = await loadVessels();
  cylinderOptions = await loadCylinders();

  await init();
}

async function init() {
  renderFuelOptions();
  renderCylinderOptions();
  renderAddonOptions();

  applyUrlToForm();
  allowedAddons = await loadAllowedAddons(form.elements.fuel.value);

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

form.addEventListener("change", async (e) => {
  if (e.target.name === "fuel") {
    allowedAddons = await loadAllowedAddons(e.target.value);
  }
  renderCost();
});

// Render on every change
function renderCost() {
  engineError.textContent = "";
  pricePara.textContent = "";

  let hasError = false;

  disableIncompatibleAddons(); //automatically gives the checked one
  const { vessel, fuel, enginesRaw, cylinders, selectedAddons } = readState();

  const engineCheck = validateEngines(enginesRaw, vessel);
  engineInput.min = vessel.minEngines;
  if (!engineCheck.ok) {
    engineError.textContent = engineCheck.message;
    hasError = true;
  }

  saveFormToUrl(vessel, fuel, enginesRaw, cylinders, selectedAddons);
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
