const vesselSelect = document.querySelector("#vessel");
const fuelSelect = document.querySelector("#fuel");
const engineInput = document.querySelector("#engines");
const previewButton = document.querySelector("#previewButton");
const summaryPara = document.querySelector("#summary");

//fuels from data.js
for (const fuel of fuels) {
  const fuelOption = document.createElement("option");
  fuelOption.textContent = fuel.name;
  console.log(fuel.name);
  fuelSelect.append(fuelOption);
}

// On Preview click, show `${vessel} · ${fuel} · ${engines} engine(s)`.

previewButton.addEventListener("click", (e) => {
  e.preventDefault();
  summaryPara.textContent = `${vesselSelect.value} · ${fuelSelect.value} · ${engineInput.value} engine(s)`;
});

//write enginePrice(fuelId, count) using find. enginePrice("diesel", 2) → 800000
//and allowedAddons(fuelId) using filter (keep add-ons with no onlyFuel or a matching one).
//allowedAddons("lng") has no scrubber

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
  //need to add guard here
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
