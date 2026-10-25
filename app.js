const fuelBox = document.querySelector("#fuelOptions");
const form = document.querySelector("#form");
const engineInput = document.querySelector("#engines");
const previewButton = document.querySelector("#previewButton");
const summaryPara = document.querySelector("#summary");

//fill fuels cards from data.js
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

// On Preview click, show `${vessel} · ${fuel} · ${engines} engine(s)`.

previewButton.addEventListener("click", (e) => {
  e.preventDefault();

  const vesselId = form.elements.vessel.value;
  const fuelId = form.elements.fuel.value;
  const vessel = findVessel(vesselId);
  const fuel = findFuel(fuelId);

  summaryPara.textContent = `${vessel.name} · ${fuel.name} · ${engineInput.value} engine(s)`;
});

function findVessel(vesselId) {
  const normalizedVesselId = vesselId.trim().toLowerCase();

  return vessels.find(
    (vessel) => vessel.id.toLowerCase() === normalizedVesselId,
  );
}

function findFuel(fuelId) {
  const normalizedFuelId = fuelId.trim().toLowerCase();

  const fuelFound = fuels.find(
    (fuel) => fuel.id.toLowerCase() === normalizedFuelId,
  );
  if (!fuelFound) {
    return undefined;
  }
  return fuelFound;
}

function enginePrice(fuelId, count) {
  if (typeof count !== "number" || count < 0) {
    return "Invalid count";
  }
  const fuelFound = findFuel(fuelId);
  if (!fuelFound) return "Fuel not found";
  return fuelFound.pricePerEngine * count;
}

function allowedAddons(fuelId) {
  const normalizedFuelID = fuelId.trim().toLowerCase();

  const fuelFound = findFuel(fuelId);
  if (!fuelFound) return "Fuel not found";
  // returns arrays of addons worksWithEveryFuel or add work with only diesel
  return addons.filter((addon) => {
    return !addon.onlyFuel || addon.onlyFuel === normalizedFuelID;
  });
}
