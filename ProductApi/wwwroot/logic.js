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

function saveFormToUrl(vessel, fuel, enginesRaw, cylinders, selectedAddons) {
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

function applyUrlToForm() {
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

function disableIncompatibleAddons() {
  const addonCheckboxes = form.querySelectorAll('input[name="addon"]');

  addonCheckboxes.forEach((el) => {
    const allowed = allowedAddons.includes(el.value);
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
