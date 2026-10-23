Session 1 · HTML, DOM and data (Fri 23 Oct)
Goal: a labelled form whose fuel options come from a data file.
Learn
• A label's for matches the input id. select holds options; .value is the chosen one.
• querySelector returns an element or null. textContent sets text. createElement + append adds elements.
• find → one item or undefined; filter → array; map → transformed array. Arrow functions: f => f.id === "lng".
• let can be reassigned, const can't. Always use === ("2" == 2 is true, "2" === 2 is false).
• Template literals: `${vessel} · ${fuel}`.
Read (20 min): MDN: label (5) · MDN: find (5) · MDN: filter (5) · MDN: Strict equality (5). Examples only.
Build: guided (35 min)

1. index.html: doctype, viewport meta, main, h1 "Ship power configurator",
   form with label + select id="vessel" (Ferry, Cargo, Cruise),

label + empty select id="fuel",
label + input type="number" id="engines" value="1",

button type="button" id="previewButton", p id="summary".

2. data.js with the data below. Load data.js, then app.js, both with defer.
3. In app.js, loop over fuels and create one option per fuel. On Preview click, show `${vessel} · ${fuel} · ${engines} engine(s)`.
   const vessels = [
   { id: "ferry", name: "Ferry", minEngines: 1 },
   { id: "cargo", name: "Cargo", minEngines: 1 },
   { id: "cruise", name: "Cruise", minEngines: 2 }
   ];
   const fuels = [
   { id: "diesel", name: "Diesel", pricePerEngine: 400000 },
   { id: "lng", name: "LNG", pricePerEngine: 520000 },
   { id: "methanol", name: "Methanol", pricePerEngine: 560000 }
   ];
   const addons = [
   { id: "hybrid", name: "Battery hybrid", price: 250000 },
   { id: "scrubber", name: "Exhaust scrubber", price: 180000, onlyFuel: "diesel" },
   { id: "monitoring", name: "Remote monitoring", price: 40000 }
   ];
   Build: your own (35 min): write enginePrice(fuelId, count) using find, and allowedAddons(fuelId) using filter (keep add-ons with no onlyFuel or a matching one). Test both in the console.
   Check
   • Fuel dropdown shows 3 fuels, built by JS
   • Cargo, LNG, 3 → "Cargo · LNG · 3 engine(s)"
   • enginePrice("diesel", 2) → 800000; allowedAddons("lng") has no scrubber
   • fuels.find(f => f.id === "hydrogen") → undefined
   Explain: find vs filter? Why are prices in data.js, not in the HTML?
   Interview questions (answer out loud)
   Question
   Short answer
   What is semantic HTML?
   Tags that describe meaning, so screen readers understand the page
   let vs const vs var?
   const can't be reassigned, let can, var is old and function-scoped
   == vs ===?
   == converts types first, === doesn't. Use ===
   find vs filter?
   find returns one item or undefined; filter returns an array
