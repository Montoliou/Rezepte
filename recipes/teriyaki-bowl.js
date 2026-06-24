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
  chickenPortions: 6,
  chickenPerPerson: 180,
  tofuPortions: 2,
  tofuPerPortion: 150,
  srirachaHeat: 2,
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

export function migrateTeriyakiSettings(input = {}) {
  if ("chickenPortions" in input || "tofuPortions" in input) {
    return input;
  }
  if ("meatEaters" in input || "vegetarians" in input) {
    return {
      ...input,
      chickenPortions: numberValue(input.meatEaters, 0),
      tofuPortions: numberValue(input.vegetarians, 0)
    };
  }
  return input;
}

function normalizeSettings(input = {}) {
  const migrated = migrateTeriyakiSettings(input);
  return {
    persons: whole(migrated.persons, 1, 30),
    finishTime: /^\d{2}:\d{2}$/.test(migrated.finishTime) ? migrated.finishTime : "13:00",
    buffer: whole(migrated.buffer, 0, 60),
    chickenPortions: whole(migrated.chickenPortions, 0, 60),
    chickenPerPerson: roundTo(clamp(numberValue(migrated.chickenPerPerson, 180), 80, 300), 10),
    tofuPortions: whole(migrated.tofuPortions, 0, 60),
    tofuPerPortion: roundTo(clamp(numberValue(migrated.tofuPerPortion, 150), 80, 300), 10),
    srirachaHeat: whole(migrated.srirachaHeat, 1, 3),
    ricePerPerson: roundTo(clamp(numberValue(migrated.ricePerPerson, 80), 50, 120), 5),
    avocadoFactor: clamp(numberValue(migrated.avocadoFactor, 0.5), 0, 1),
    mangoFactor: clamp(numberValue(migrated.mangoFactor, 0.25), 0, 1),
    edamameEnabled: migrated.edamameEnabled !== false
  };
}

export function validateTeriyakiSettings(input = {}) {
  const settings = normalizeSettings({
    ...defaultTeriyakiSettings,
    ...migrateTeriyakiSettings(input)
  });
  const errors = [];
  return { settings, errors, valid: errors.length === 0 };
}

function makeIngredient(label, value, note = "") {
  return { label, value, note };
}

function makeShoppingItem(id, label, value, note = "") {
  return { id, label, value, note };
}

export function calculateTeriyakiBowl(input = {}) {
  const validation = validateTeriyakiSettings(input);
  if (!validation.valid) {
    return { ...validation, plan: null };
  }

  const settings = validation.settings;
  const chickenPortions = settings.chickenPortions;
  const tofuPortions = settings.tofuPortions;
  const chickenPlanned = chickenPortions * settings.chickenPerPerson;
  const tofuGrams = tofuPortions * settings.tofuPerPortion;
  const totalProteinPortions = chickenPortions + tofuPortions;
  const proteinDifference = totalProteinPortions - settings.persons;

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
    ...(proteinGrams > 0 ? [{
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
    }] : []),
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
        ...((timeline.tofuBatches + timeline.chickenBatches) > 0
          ? [makeIngredient(
            "Neutrales Öl zum Braten",
            formatVolume((timeline.tofuBatches + timeline.chickenBatches) * 10)
          )]
          : [])
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
  ].filter((group) => group.items.length > 0);

  const shoppingGroups = [
    {
      id: "shopping-rice",
      title: "Reis und Vorrat",
      items: [
        makeShoppingItem("shop-rice", "Sushireis", formatMass(riceGrams)),
        makeShoppingItem("shop-rice-vinegar", "Reisessig", formatVolume(riceVinegarMillilitres)),
        makeShoppingItem("shop-rice-sugar", "Zucker", formatMass(riceSugarGrams)),
        makeShoppingItem("shop-salt", "Salz", formatMass(riceSaltGrams)),
        ...((timeline.tofuBatches + timeline.chickenBatches) > 0
          ? [makeShoppingItem(
            "shop-oil",
            "Neutrales Öl zum Braten",
            formatVolume((timeline.tofuBatches + timeline.chickenBatches) * 10)
          )]
          : [])
      ]
    },
    {
      id: "shopping-proteins",
      title: "Proteine",
      items: [
        ...(chickenPlanned > 0
          ? [makeShoppingItem("shop-chicken", "Hähnchen", formatMass(chickenPlanned), `${chickenPortions} Portion(en)`)]
          : []),
        ...(tofuGrams > 0
          ? [makeShoppingItem("shop-tofu", "Naturtofu", formatMass(tofuGrams), `${tofuPortions} Portion(en)`)]
          : [])
      ]
    },
    {
      id: "shopping-produce",
      title: "Gemüse und Obst",
      items: [
        ...(avocadoCount ? [makeShoppingItem("shop-avocado", "Avocado", formatPiece(avocadoCount, "Stück"))] : []),
        makeShoppingItem("shop-cucumber", "Große Gurke", formatPiece(cucumberCount, "Stück")),
        ...(mangoCount ? [makeShoppingItem("shop-mango", "Mango", formatPiece(mangoCount, "Stück"))] : []),
        makeShoppingItem("shop-onions", "Frühlingszwiebeln", formatPiece(springOnionCount, "Stück")),
        ...(edamameGrams ? [makeShoppingItem("shop-edamame", "Edamame", formatMass(edamameGrams))] : []),
        makeShoppingItem("shop-limes", "Limetten", formatPiece(limeCount, "Stück")),
        ...(proteinGrams > 0 ? [
          makeShoppingItem("shop-ginger", "Ingwer", formatMass(gingerGrams)),
          makeShoppingItem("shop-garlic", "Knoblauch", formatMass(garlicGrams))
        ] : [])
      ]
    },
    {
      id: "shopping-sauces",
      title: "Saucen und Würzung",
      items: [
        ...(proteinGrams > 0 ? [
          makeShoppingItem("shop-soy", "Sojasauce", formatVolume(soyMillilitres)),
          makeShoppingItem("shop-mirin", "Mirin", formatVolume(mirinMillilitres)),
          makeShoppingItem("shop-sauce-sugar", "Zucker oder Honig", formatMass(sauceSugarGrams)),
          makeShoppingItem("shop-sesame-oil", "Sesamöl", formatVolume(sesameOilMillilitres))
        ] : []),
        makeShoppingItem("shop-mayo", "Mayonnaise", formatVolume(mayoMillilitres)),
        makeShoppingItem("shop-sriracha", "Sriracha", formatVolume(srirachaMillilitres)),
        makeShoppingItem("shop-sesame", "Sesam", formatMass(sesameGrams))
      ]
    },
    {
      id: "shopping-optional",
      title: "Optional",
      items: [
        makeShoppingItem("shop-nori", "Nori", formatPiece(noriSheets, "Blatt", "Blätter"))
      ]
    }
  ].filter((group) => group.items.length > 0);

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
    ...(proteinGrams > 0 ? [{
      id: "mise-sauce",
      title: "Teriyaki-Sauce anrühren",
      detail: `${formatVolume(soyMillilitres)} Sojasauce, ${formatVolume(mirinMillilitres)} Mirin, ${formatMass(sauceSugarGrams)} Zucker oder Honig, Ingwer, Knoblauch, Sesamöl und Wasser verrühren.`
    }] : []),
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
      instruction: proteinGrams > 0
        ? "Arbeitsplatz aufbauen, Proteine vorbereiten und beide Saucen anrühren."
        : "Arbeitsplatz aufbauen und die Sriracha-Mayo anrühren.",
      details: [
        tofuGrams > 0 ? `${formatMass(tofuGrams)} Tofu pressen.` : null,
        chickenPlanned > 0 ? `${formatMass(chickenPlanned)} Hähnchen getrennt vorbereiten.` : null,
        tofuGrams > 0 && chickenPlanned > 0 ? "Vegetarisches Besteck klar getrennt bereitlegen." : null
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

  const advisory = proteinDifference < 0
    ? `Für ${Math.abs(proteinDifference)} Person(en) ist noch keine Proteinportion gewählt.`
    : proteinDifference > 0
      ? `${proteinDifference} zusätzliche Proteinportion(en) sind eingeplant. Das ist zulässig, wenn jemand beide Varianten probieren möchte.`
      : "";

  const proteinLogic = `${chickenPortions} Hähnchenportion(en) à ${formatMass(settings.chickenPerPerson)} und ${tofuPortions} Tofuportion(en) à ${formatMass(settings.tofuPerPortion)}.`;

  return {
    ...validation,
    plan: {
      chickenPortions,
      chickenPlanned,
      tofuPortions,
      tofuGrams,
      totalProteinPortions,
      proteinDifference,
      riceGrams,
      proteinGrams,
      ingredientGroups,
      shoppingGroups,
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
      logicText: `${totalProteinPortions} Proteinportion(en) für ${settings.persons} Personen. ${proteinLogic}`
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
  migrateSettings: migrateTeriyakiSettings,
  validate: validateTeriyakiSettings,
  calculate: calculateTeriyakiBowl
};
