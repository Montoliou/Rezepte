import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateTeriyakiBowl,
  defaultTeriyakiSettings,
  migrateTeriyakiSettings
} from "../recipes/teriyaki-bowl.js";

function ingredientLabels(plan) {
  return plan.ingredientGroups.flatMap((group) => group.items.map((item) => item.label));
}

function shoppingLabels(plan) {
  return plan.shoppingGroups.flatMap((group) => group.items.map((item) => item.label));
}

test("Standardplanung berechnet direkte Hähnchen- und Tofumengen", () => {
  const result = calculateTeriyakiBowl(defaultTeriyakiSettings);

  assert.equal(result.valid, true);
  assert.equal(result.plan.chickenPortions, 6);
  assert.equal(result.plan.chickenPlanned, 1080);
  assert.equal(result.plan.tofuPortions, 2);
  assert.equal(result.plan.tofuGrams, 300);
  assert.equal(result.plan.totalProteinPortions, 8);
  assert.equal(result.plan.proteinDifference, 0);
  assert.equal(result.plan.riceGrams, 640);
  assert.equal(result.plan.timeline.startTime, "10:50");
  assert.equal(result.plan.advisory, "");
});

test("Proteinportionen dürfen die Personenzahl überschreiten", () => {
  const result = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    chickenPortions: 8,
    tofuPortions: 2
  });

  assert.equal(result.plan.totalProteinPortions, 10);
  assert.equal(result.plan.proteinDifference, 2);
  assert.match(result.plan.advisory, /2 zusätzliche Proteinportion/);
});

test("fehlende Proteinportionen werden angezeigt und nicht automatisch ergänzt", () => {
  const result = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    chickenPortions: 4,
    tofuPortions: 2
  });

  assert.equal(result.plan.totalProteinPortions, 6);
  assert.equal(result.plan.proteinDifference, -2);
  assert.equal(result.plan.chickenPlanned, 720);
  assert.equal(result.plan.tofuGrams, 300);
  assert.match(result.plan.advisory, /Für 2 Person/);
});

test("ohne Tofuportionen entfallen Tofu in Zutaten, Einkaufsliste und Ablauf", () => {
  const result = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    chickenPortions: 8,
    tofuPortions: 0
  });
  const miseIds = result.plan.miseTasks.map((task) => task.id);
  const cookIds = result.plan.cookSteps.map((step) => step.id);

  assert.equal(result.plan.tofuGrams, 0);
  assert.equal(ingredientLabels(result.plan).includes("Naturtofu"), false);
  assert.equal(shoppingLabels(result.plan).includes("Naturtofu"), false);
  assert.equal(miseIds.includes("mise-tofu"), false);
  assert.equal(cookIds.includes("tofu-cook"), false);
});

test("ohne Hähnchenportionen entfallen Hähnchen in Zutaten, Einkaufsliste und Ablauf", () => {
  const result = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    chickenPortions: 0,
    tofuPortions: 8
  });
  const miseIds = result.plan.miseTasks.map((task) => task.id);
  const cookIds = result.plan.cookSteps.map((step) => step.id);

  assert.equal(result.plan.chickenPlanned, 0);
  assert.equal(ingredientLabels(result.plan).includes("Hähnchen einplanen"), false);
  assert.equal(shoppingLabels(result.plan).includes("Hähnchen"), false);
  assert.equal(miseIds.includes("mise-chicken"), false);
  assert.equal(cookIds.includes("chicken-cook"), false);
});

test("individuelle Grammwerte skalieren den Einkaufsbedarf", () => {
  const result = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    chickenPortions: 5,
    chickenPerPerson: 200,
    tofuPortions: 3,
    tofuPerPortion: 180
  });

  assert.equal(result.plan.chickenPlanned, 1000);
  assert.equal(result.plan.tofuGrams, 540);
  assert.match(result.plan.logicText, /5 Hähnchenportion/);
  assert.match(result.plan.logicText, /3 Tofuportion/);
});

test("alte Gästeeinstellungen werden einmalig auf direkte Portionen migriert", () => {
  const oldSettings = {
    persons: 8,
    meatEaters: 3,
    vegetarians: 2,
    chickenAvailable: 450,
    flexTofuShare: 50
  };
  const migrated = migrateTeriyakiSettings(oldSettings);
  const result = calculateTeriyakiBowl(oldSettings);

  assert.equal(migrated.chickenPortions, 3);
  assert.equal(migrated.tofuPortions, 2);
  assert.equal(result.plan.chickenPortions, 3);
  assert.equal(result.plan.tofuPortions, 2);
});

test("deaktivierte optionale Zutaten verschwinden aus Zutaten, Einkaufsliste und Mise en Place", () => {
  const result = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    edamameEnabled: false,
    mangoFactor: 0
  });
  const miseIds = result.plan.miseTasks.map((task) => task.id);

  assert.equal(ingredientLabels(result.plan).includes("Edamame"), false);
  assert.equal(ingredientLabels(result.plan).includes("Mango"), false);
  assert.equal(shoppingLabels(result.plan).includes("Edamame"), false);
  assert.equal(shoppingLabels(result.plan).includes("Mango"), false);
  assert.equal(miseIds.includes("mise-edamame"), false);
  assert.equal(miseIds.includes("mise-mango"), false);
});

test("große Proteinmengen erhalten Chargenhinweise", () => {
  const result = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    persons: 30,
    chickenPortions: 20,
    tofuPortions: 10,
    chickenPerPerson: 180,
    tofuPerPortion: 150
  });

  assert.equal(result.valid, true);
  assert.ok(result.plan.timeline.totalLead > 120);
  assert.ok(result.plan.timeline.tofuBatches > 1);
  assert.ok(result.plan.timeline.chickenBatches > 1);
  assert.match(
    result.plan.cookSteps.find((step) => step.id === "tofu-cook").title,
    /Chargen/
  );
});
