//DOM reference
const fuelBox = document.querySelector("#fuelOptions");
const addonBox = document.querySelector("#addonOptions");
const form = document.querySelector("#form");
const engineInput = document.querySelector("#engines");
const summaryPara = document.querySelector("#summary");

init();

function init() {
  renderFuelOptions();
  renderAddonOptions();
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
    if (fuel.id === "diesel") {
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
    input.value = `${addon.id}`;
    if (addon.id === "monitoring") {
      input.checked = true;
    }

    const labelText = `${addon.name} · €${addon.price.toLocaleString("en-US")}`;
    label.append(input);
    label.append(labelText);
    addonBox.append(label);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const vesselId = form.elements.vessel.value;
  const fuelId = form.elements.fuel.value;
  const addonInputLists = form.querySelectorAll('input[name="addon"]');

  const vessel = findById(vessels, vesselId);
  const fuel = findById(fuels, fuelId);
  const addonNames = [];

  for (const el of addonInputLists) {
    if (el.checked) {
      const addon = findById(addons, el.value);
      addonNames.push(addon.name);
    }
  }

  summaryPara.textContent = `${vessel.name} · ${fuel.name} · ${engineInput.value} engine(s) · ${addonNames.join(", ")}`;
});

function findById(list, id) {
  return list.find((item) => item.id === id);
}

function enginePrice(fuelId, count) {
  if (typeof count !== "number" || count < 0) {
    return "Invalid count";
  }
  const fuelFound = findById(fuels, fuelId);
  if (!fuelFound) return "Fuel not found";
  return fuelFound.pricePerEngine * count;
}

function allowedAddons(fuelId) {
  const fuelFound = findById(fuels, fuelId);
  if (!fuelFound) return "Fuel not found";
  // returns arrays of addons worksWithEveryFuel or add work with only diesel
  return addons.filter((addon) => {
    return !addon.onlyFuel || addon.onlyFuel === fuelId;
  });
}
