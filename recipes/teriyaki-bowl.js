import {
  formatInteger,
  formatMass,
  formatPiece,
  formatVolume
} from "../lib/format.js";
import { buildTimeline } from "../lib/timeline.js";

export const defaultTeriyakiSettings = Object.freeze({
  persons: 8,
  finishTime: "13:00",
  buffer: 0,
  vegetarians: 2,
  meatEaters: 2,
  chickenAvailable: 450,
  chickenPerPerson: 180,
  tofuPerPortion: 150,
  flexTofuShare: 50,
  srirachaHeat: 2,
  useAllChicken: false,
  ricePerPerson: 80,
  avocadoFactor: 0.5,
  mangoFactor: 0.25,
  edamameEnabled: true
});

function numberValue(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function whole(value, min, max) {
  return Math.floor(clamp(numberValue(value, min), min, max));
}

function roundTo(value, step = 1) {
  return Math.round(value / step) * step;
}

function normalizeSettings(input = {}) {
  return {
    persons: whole(input.persons, 1, 30),
    finishTime: /^\d{2}:\d{2}$/.test(input.finishTime) ? input.finishTime : "13:00",
    buffer: whole(input.buffer, 0, 60),
    vegetarians: whole(input.vegetarians, 0, 30),
    meatEaters: whole(input.meatEaters, 0, 30),
    chickenAvailable: roundTo(clamp(numberValue(input.chickenAvailable, 450), 0, 10000), 10),
    chickenPerPerson: roundTo(clamp(numberValue(input.chickenPerPerson, 180), 80, 300), 10),
    tofuPerPortion: roundTo(clamp(numberValue(input.tofuPerPortion, 150), 80, 300), 10),
    flexTofuShare: clamp(numberValue(input.flexTofuShare, 50), 0, 100),
    srirachaHeat: whole(input.srirachaHeat, 1, 3),
    useAllChicken: Boolean(input.useAllChicken),
    ricePerPerson: roundTo(clamp(numberValue(input.ricePerPerson, 80), 50, 120), 5),
    avocadoFactor: clamp(numberValue(input.avocadoFactor, 0.5), 0, 1),
    mangoFactor: clamp(numberValue(input.mangoFactor, 0.25), 0, 1),
    edamameEnabled: input.edamameEnabled !== false
  };
}

export function validateTeriyakiSettings(input = {}) {
  const settings = normalizeSettings({ ...defaultTeriyakiSettings, ...input });
  const errors = [];

  if (settings.vegetarians + settings.meatEaters > settings.persons) {
    errors.push(
      `Vegetarier und Fleischesser ergeben zusammen ${settings.vegetarians + settings.meatEaters}, geplant sind aber nur ${settings.persons} Personen.`
    );
  }

  return { settings, errors, valid: errors.length === 0 };
}

function makeIngredient(label, value, note = "") {
  return { label, value, note };
}

export function calculateTeriyakiBowl(input = {}) {
  const validation = validateTeriyakiSettings(input);
  if (!validation.valid) {
    return { ...validation, plan: null };
  }

  const settings = validation.settings;
  const flexible = settings.persons - settings.vegetarians - settings.meatEaters;
  const chickenCapacity = Math.floor(settings.chickenAvailable / settings.chickenPerPerson);
  const chickenPortions = Math.min(settings.meatEaters, chickenCapacity);
  const chickenNeededForPortions = chickenPortions * settings.chickenPerPerson;
  const chickenPlanned = settings.meatEaters === 0
    ? 0
    : settings.useAllChicken
      ? settings.chickenAvailable
      : chickenNeededForPortions;
  const chickenSurplus = Math.max(0, settings.chickenAvailable - chickenPlanned);
  const uncoveredMeatEaters = settings.meatEaters - chickenPortions;
  const tofuIsNeeded = settings.vegetarians > 0;
  const flexibleTofuPortions = tofuIsNeeded
    ? Math.ceil(flexible * (settings.flexTofuShare / 100))
    : 0;
  const tofuFallbackPortions = tofuIsNeeded ? uncoveredMeatEaters : 0;
  const tofuPortions = settings.vegetarians + tofuFallbackPortions + flexibleTofuPortions;
  const tofuGrams = tofuPortions * settings.tofuPerPortion;

  const riceGrams = roundTo(settings.persons * settings.ricePerPerson, 5);
  const waterMillilitres = roundTo(riceGrams * 1.1875, 5);
  const riceScale = riceGrams / 80;
  const riceVinegarMillilitres = roundTo(riceScale * 18.75, 5);
  const riceSugarGrams = roundTo(riceScale * 7.5, 1);
  const riceSaltGrams = roundTo(riceScale * 1.8, 1);

  const proteinGrams = chickenPlanned + tofuGrams;
  const proteinScale = proteinGrams / 150;
  const soyMillilitres = roundTo(proteinScale * 18.75, 5);
  const mirinMillilitres = roundTo(proteinScale * 9.375, 5);
  const sauceSugarGrams = roundTo(proteinScale * 7.5, 1);
  const sesameOilMillilitres = roundTo(proteinScale * 1.6, 1);
  const gingerGrams = roundTo(proteinScale * 1.25, 1);
  const garlicGrams = roundTo(proteinScale * 1.25, 1);
  const sauceWaterMillilitres = roundTo(proteinScale * 6, 5);

  const mayoMillilitres = roundTo(settings.persons * 11.25, 5);
  const heatFactor = settings.srirachaHeat === 1 ? 2.25 : settings.srirachaHeat === 2 ? 3.25 : 4.5;
  const srirachaMillilitres = roundTo(settings.persons * heatFactor, 1);
  const limeJuiceMillilitres = roundTo(settings.persons * 1.25, 1);
  const mayoWaterMillilitres = roundTo(settings.persons * 0.75, 1);

  const avocadoCount = Math.ceil(settings.persons * settings.avocadoFactor);
  const cucumberCount = Math.ceil(settings.persons * 0.25);
  const mangoCount = Math.ceil(settings.persons * settings.mangoFactor);
  const springOnionCount = Math.ceil(settings.persons * 0.5);
  const edamameGrams = settings.edamameEnabled ? roundTo(settings.persons * 50, 5) : 0;
  const sesameGrams = roundTo(settings.persons * 3, 1);
  const noriSheets = Math.ceil(settings.persons * 0.5);
  const limeCount = Math.max(1, Math.ceil(settings.persons * 0.25));

  const timeline = buildTimeline({
    finishTime: settings.finishTime,
    buffer: settings.buffer,
    tofuGrams,
    chickenGrams: chickenPlanned,
    prepScale: Math.max(1, settings.persons / 8)
  });

  const ingredientGroups = [
    {
      id: "rice",
      title: "Sushi-Reis",
      items: [
        makeIngredient("Sushireis", formatMass(riceGrams)),
        makeIngredient("Wasser", formatVolume(waterMillilitres)),
        makeIngredient("Reisessig", formatVolume(riceVinegarMillilitres)),
        makeIngredient("Zucker", formatMass(riceSugarGrams)),
        makeIngredient("Salz", formatMass(riceSaltGrams))
      ]
    },
    {
      id: "sauce",
      title: "Teriyaki-Sauce",
      description: `Skaliert auf ${formatMass(proteinGrams)} tatsächlich geplante Proteine.`,
      items: [
        makeIngredient("Sojasauce", formatVolume(soyMillilitres)),
        makeIngredient("Mirin", formatVolume(mirinMillilitres)),
        makeIngredient("Zucker oder Honig", formatMass(sauceSugarGrams)),
        makeIngredient("Sesamöl", formatVolume(sesameOilMillilitres)),
        makeIngredient("Ingwer, fein gerieben", formatMass(gingerGrams)),
        makeIngredient("Knoblauch, fein gerieben", formatMass(garlicGrams)),
        makeIngredient("Wasser", formatVolume(sauceWaterMillilitres))
      ]
    },
    {
      id: "proteins",
      title: "Proteine",
      items: [
        ...(chickenPlanned > 0
          ? [makeIngredient("Hähnchen einplanen", formatMass(chickenPlanned), `${chickenPortions} volle Portion(en)`)]
          : []),
        ...(tofuGrams > 0
          ? [makeIngredient("Naturtofu", formatMass(tofuGrams), `${tofuPortions} Portion(en)`)]
          : []),
        makeIngredient(
          "Neutrales Öl zum Braten",
          formatVolume((timeline.tofuBatches + timeline.chickenBatches) * 10)
        )
      ]
    },
    {
      id: "mayo",
      title: "Sriracha-Mayo",
      items: [
        makeIngredient("Mayonnaise", formatVolume(mayoMillilitres)),
        makeIngredient("Sriracha", formatVolume(srirachaMillilitres)),
        makeIngredient("Limettensaft", formatVolume(limeJuiceMillilitres)),
        makeIngredient("Wasser oder Reisessig", formatVolume(mayoWaterMillilitres), "optional zum Verdünnen")
      ]
    },
    {
      id: "toppings",
      title: "Toppings und Extras",
      items: [
        ...(avocadoCount ? [makeIngredient("Avocado", formatPiece(avocadoCount, "Stück"))] : []),
        makeIngredient("Große Gurke", formatPiece(cucumberCount, "Stück")),
        ...(mangoCount ? [makeIngredient("Mango", formatPiece(mangoCount, "Stück"))] : []),
        makeIngredient("Frühlingszwiebeln", formatPiece(springOnionCount, "Stück")),
        ...(edamameGrams ? [makeIngredient("Edamame", formatMass(edamameGrams))] : []),
        makeIngredient("Sesam", formatMass(sesameGrams)),
        makeIngredient("Nori", formatPiece(noriSheets, "Blatt", "Blätter"), "optional"),
        makeIngredient("Limetten", formatPiece(limeCount, "Stück"))
      ]
    }
  ];

  const miseTasks = [
    {
      id: "mise-workspace",
      title: "Arbeitsplatz und Servierschalen aufbauen",
      detail: "Separate Pfannenwender und Servierzangen für Tofu und Hähnchen bereitlegen."
    },
    ...(tofuGrams > 0 ? [{
      id: "mise-tofu",
      title: `${formatMass(tofuGrams)} Tofu pressen und würfeln`,
      detail: "Auf Küchenpapier abtropfen lassen. So bräunt er statt zu dämpfen."
    }] : []),
    ...(chickenPlanned > 0 ? [{
      id: "mise-chicken",
      title: `${formatMass(chickenPlanned)} Hähnchen schneiden`,
      detail: "In gleichmäßige, mundgerechte Stücke schneiden und getrennt vom Tofu lagern."
    }] : []),
    {
      id: "mise-sauce",
      title: "Teriyaki-Sauce anrühren",
      detail: `${formatVolume(soyMillilitres)} Sojasauce, ${formatVolume(mirinMillilitres)} Mirin, ${formatMass(sauceSugarGrams)} Zucker oder Honig, Ingwer, Knoblauch, Sesamöl und Wasser verrühren.`
    },
    {
      id: "mise-mayo",
      title: "Sriracha-Mayo anrühren",
      detail: `${formatVolume(mayoMillilitres)} Mayonnaise mit ${formatVolume(srirachaMillilitres)} Sriracha und ${formatVolume(limeJuiceMillilitres)} Limettensaft verrühren.`
    },
    {
      id: "mise-cucumber",
      title: `${formatPiece(cucumberCount, "Gurke", "Gurken")} waschen und schneiden`,
      detail: "In dünne Scheiben oder Halbmonde schneiden."
    },
    ...(mangoCount ? [{
      id: "mise-mango",
      title: `${formatPiece(mangoCount, "Mango", "Mangos")} würfeln`,
      detail: "Abgedeckt kühl stellen."
    }] : []),
    {
      id: "mise-onions",
      title: `${formatPiece(springOnionCount, "Frühlingszwiebel", "Frühlingszwiebeln")} schneiden`,
      detail: "In feine Ringe schneiden."
    },
    ...(edamameGrams ? [{
      id: "mise-edamame",
      title: `${formatMass(edamameGrams)} Edamame garen`,
      detail: "Nach Packungsangabe garen, abgießen und leicht salzen."
    }] : []),
    {
      id: "mise-avocado",
      title: `${formatPiece(avocadoCount, "Avocado", "Avocados")} bereitlegen`,
      detail: "Noch nicht schneiden. Das erfolgt erst direkt vor dem Servieren."
    }
  ];

  const stepContent = {
    start: {
      instruction: "Arbeitsplatz aufbauen, Tofu pressen und beide Saucen anrühren.",
      details: [
        tofuGrams > 0 ? `${formatMass(tofuGrams)} Tofu pressen.` : null,
        chickenPlanned > 0 ? `${formatMass(chickenPlanned)} Hähnchen getrennt vorbereiten.` : null,
        "Vegetarisches Besteck klar getrennt bereitlegen."
      ].filter(Boolean),
      parallel: "Die kalten Zutaten können danach ohne Qualitätsverlust vorbereitet werden."
    },
    "cold-prep": {
      instruction: "Gurke, Mango und Frühlingszwiebeln schneiden. Edamame gegebenenfalls vorgaren.",
      details: [
        `${formatPiece(cucumberCount, "Gurke", "Gurken")} schneiden.`,
        mangoCount ? `${formatPiece(mangoCount, "Mango", "Mangos")} würfeln.` : null,
        edamameGrams ? `${formatMass(edamameGrams)} Edamame garen.` : null,
        "Avocado noch nicht anschneiden."
      ].filter(Boolean),
      parallel: "Die fertigen Toppings abgedeckt und getrennt bereitstellen."
    },
    "rice-wash": {
      instruction: `${formatMass(riceGrams)} Sushireis gründlich waschen, bis das Wasser klar bleibt. Danach 20–30 Minuten abtropfen lassen.`,
      details: [`Anschließend mit ${formatVolume(waterMillilitres)} Wasser garen.`],
      parallel: "Währenddessen Teriyaki-Sauce und Sriracha-Mayo fertig abschmecken."
    },
    "rice-cook": {
      instruction: `Reis mit ${formatVolume(waterMillilitres)} Wasser aufkochen, 15 Minuten auf kleinster Stufe garen und 10 Minuten bei geschlossenem Deckel ruhen lassen.`,
      details: ["Deckel während Gar- und Ruhezeit geschlossen lassen."],
      parallel: "Pfannen und Bratöl für die Proteine bereitstellen."
    },
    "rice-season": {
      instruction: "Reisessig, Zucker und Salz kurz lösen und vorsichtig unter den Reis heben.",
      details: [
        `${formatVolume(riceVinegarMillilitres)} Reisessig`,
        `${formatMass(riceSugarGrams)} Zucker`,
        `${formatMass(riceSaltGrams)} Salz`
      ],
      parallel: "Reis locker ausdampfen lassen, nicht kaltstellen."
    },
    "tofu-cook": {
      instruction: `${formatMass(tofuGrams)} Tofu goldbraun braten und mit einem Teil der Teriyaki-Sauce glasieren.`,
      details: [
        `${timeline.tofuBatches} Charge(n) einplanen.`,
        "Tofu zuerst braten, damit Pfanne und Werkzeug vegetarisch sauber bleiben."
      ],
      parallel: "Fertigen Tofu warm halten, aber nicht abdecken, damit er knusprig bleibt."
    },
    "chicken-cook": {
      instruction: `${formatMass(chickenPlanned)} Hähnchen portionsweise kräftig anbraten, vollständig durchgaren und separat glasieren.`,
      details: [
        `${timeline.chickenBatches} Charge(n) einplanen.`,
        "Nicht dieselbe Zange wie für den Tofu verwenden."
      ],
      parallel: "Während der letzten Charge die Bowl-Bar in Servierreihenfolge aufbauen."
    },
    avocado: {
      instruction: `${formatPiece(avocadoCount, "Avocado", "Avocados")} schneiden und mit etwas Limettensaft beträufeln.`,
      details: ["Erst jetzt schneiden, damit die Avocado frisch bleibt."],
      parallel: "Reis und Proteine bereits in Servierschalen stellen."
    },
    assemble: {
      instruction: "Bowl-Bar in einer eindeutigen Reihenfolge aufstellen.",
      details: [
        "Schüsseln → Reis → Tofu → Hähnchen → Gurke → Mango → Avocado → Edamame → Frühlingszwiebeln → Sesam → Saucen.",
        "Tofu und Hähnchen mit getrenntem Besteck servieren."
      ],
      parallel: ""
    },
    serve: {
      instruction: "Alles ist bereit. Reis warm bis lauwarm servieren und die Bowls direkt zusammenstellen.",
      details: [],
      parallel: ""
    }
  };

  const cookSteps = timeline.steps.map((step) => ({
    ...step,
    ...stepContent[step.id],
    timerMinutes: step.duration
  }));

  const advisory = uncoveredMeatEaters > 0 && tofuIsNeeded
    ? `${uncoveredMeatEaters} Fleischesser werden wegen der vorhandenen Hähnchenmenge zusätzlich mit Tofu eingeplant.`
    : uncoveredMeatEaters > 0
      ? `${uncoveredMeatEaters} Fleischesser sind mit der vorhandenen Hähnchenmenge nicht abgedeckt. Es wird kein Tofu eingeplant, da keine vegetarischen Gäste angegeben sind.`
      : chickenSurplus > 0
      ? `${formatMass(chickenSurplus)} Hähnchen bleiben übrig und werden nicht automatisch eingeplant.`
      : settings.useAllChicken && chickenPlanned > chickenNeededForPortions
        ? `${formatMass(chickenPlanned - chickenNeededForPortions)} Hähnchen werden als zusätzliche Menge mitgebraten.`
        : "";

  const proteinLogic = [
    settings.vegetarians === 0
      ? "Kein Tofu, da keine vegetarischen Gäste angegeben sind."
      : flexibleTofuPortions > 0
        ? `Für flexible Gäste sind ${flexibleTofuPortions} zusätzliche Tofuportion(en) eingeplant.`
        : "Tofu wird nur für die vegetarischen Gäste eingeplant.",
    settings.meatEaters === 0
      ? "Kein Hähnchen, da keine Fleischesser angegeben sind."
      : ""
  ].filter(Boolean).join(" ");

  return {
    ...validation,
    plan: {
      flexible,
      chickenPortions,
      chickenPlanned,
      chickenSurplus,
      uncoveredMeatEaters,
      flexibleTofuPortions,
      tofuPortions,
      tofuGrams,
      riceGrams,
      proteinGrams,
      ingredientGroups,
      miseTasks,
      cookSteps,
      timeline,
      advisory,
      summary: [
        { id: "start", label: "Start um", value: `${timeline.startTime} Uhr`, icon: "clock" },
        { id: "rice", label: "Reis", value: formatMass(riceGrams), icon: "bowl" },
        { id: "chicken", label: "Hähnchen", value: formatMass(chickenPlanned), icon: "chicken" },
        { id: "tofu", label: "Tofu", value: formatMass(tofuGrams), icon: "cube" }
      ],
      logicText: `${settings.vegetarians} vegetarisch, ${settings.meatEaters} mit Fleisch, ${flexible} flexibel. ${proteinLogic}`
    }
  };
}

export const teriyakiBowl = {
  id: "teriyaki-bowl",
  name: "Teriyaki Bowl",
  description: "Sushi-Reis, Teriyaki-Tofu und Hähnchen mit frischen Toppings und Sriracha-Mayo.",
  image: "./assets/images/teriyaki-bowl.png",
  duration: "ca. 2 Stunden",
  servingRange: "1–30 Personen",
  dietary: "Vegetarisch möglich",
  defaults: defaultTeriyakiSettings,
  validate: validateTeriyakiSettings,
  calculate: calculateTeriyakiBowl
};
