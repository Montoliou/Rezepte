import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateTeriyakiBowl,
  defaultTeriyakiSettings
} from "../recipes/teriyaki-bowl.js";

test("Standardplanung für acht Personen entspricht dem Referenzfall", () => {
  const result = calculateTeriyakiBowl(defaultTeriyakiSettings);

  assert.equal(result.valid, true);
  assert.equal(result.plan.flexible, 4);
  assert.equal(result.plan.chickenPortions, 2);
  assert.equal(result.plan.chickenPlanned, 360);
  assert.equal(result.plan.chickenSurplus, 90);
  assert.equal(result.plan.tofuPortions, 4);
  assert.equal(result.plan.tofuGrams, 600);
  assert.equal(result.plan.riceGrams, 640);
  assert.equal(result.plan.timeline.startTime, "11:00");
});

test("zu wenig Hähnchen erzeugt eine zusätzliche Tofuportion", () => {
  const result = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    chickenAvailable: 300
  });

  assert.equal(result.plan.chickenPortions, 1);
  assert.equal(result.plan.chickenPlanned, 180);
  assert.equal(result.plan.uncoveredMeatEaters, 1);
  assert.equal(result.plan.tofuPortions, 5);
  assert.equal(result.plan.tofuGrams, 750);
  assert.match(result.plan.advisory, /1 Fleischesser/);
});

test("ohne vegetarische Gäste wird kein Tofu eingeplant", () => {
  const result = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    vegetarians: 0,
    meatEaters: 8,
    chickenAvailable: 450
  });
  const ingredientLabels = result.plan.ingredientGroups.flatMap((group) => group.items.map((item) => item.label));
  const miseIds = result.plan.miseTasks.map((task) => task.id);
  const cookIds = result.plan.cookSteps.map((step) => step.id);

  assert.equal(result.plan.tofuPortions, 0);
  assert.equal(result.plan.tofuGrams, 0);
  assert.equal(result.plan.flexibleTofuPortions, 0);
  assert.equal(ingredientLabels.includes("Naturtofu"), false);
  assert.equal(miseIds.includes("mise-tofu"), false);
  assert.equal(cookIds.includes("tofu-cook"), false);
  assert.match(result.plan.advisory, /kein Tofu eingeplant/i);
});

test("ohne Fleischesser wird auch bei aktiviertem Überschuss kein Hähnchen eingeplant", () => {
  const result = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    vegetarians: 8,
    meatEaters: 0,
    useAllChicken: true
  });
  const ingredientLabels = result.plan.ingredientGroups.flatMap((group) => group.items.map((item) => item.label));
  const miseIds = result.plan.miseTasks.map((task) => task.id);
  const cookIds = result.plan.cookSteps.map((step) => step.id);

  assert.equal(result.plan.chickenPortions, 0);
  assert.equal(result.plan.chickenPlanned, 0);
  assert.equal(ingredientLabels.includes("Hähnchen einplanen"), false);
  assert.equal(miseIds.includes("mise-chicken"), false);
  assert.equal(cookIds.includes("chicken-cook"), false);
  assert.match(result.plan.logicText, /Kein Hähnchen/);
});

test("Hähnchenüberschuss wird nur nach expliziter Auswahl mitgebraten", () => {
  const conservative = calculateTeriyakiBowl(defaultTeriyakiSettings);
  const useAll = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    useAllChicken: true
  });

  assert.equal(conservative.plan.chickenPlanned, 360);
  assert.equal(useAll.plan.chickenPlanned, 450);
  assert.match(useAll.plan.advisory, /zusätzliche Menge/);
});

test("widersprüchliche Gästezahlen werden sichtbar abgelehnt", () => {
  const result = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    persons: 8,
    vegetarians: 5,
    meatEaters: 4
  });

  assert.equal(result.valid, false);
  assert.equal(result.plan, null);
  assert.match(result.errors[0], /zusammen 9/);
});

test("deaktivierte optionale Zutaten verschwinden aus Zutaten und Mise en Place", () => {
  const result = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    edamameEnabled: false,
    mangoFactor: 0
  });
  const ingredientLabels = result.plan.ingredientGroups.flatMap((group) => group.items.map((item) => item.label));
  const miseIds = result.plan.miseTasks.map((task) => task.id);

  assert.equal(ingredientLabels.includes("Edamame"), false);
  assert.equal(ingredientLabels.includes("Mango"), false);
  assert.equal(miseIds.includes("mise-edamame"), false);
  assert.equal(miseIds.includes("mise-mango"), false);
});

test("große Gruppen erhalten mehr Vorlauf und Chargenhinweise", () => {
  const result = calculateTeriyakiBowl({
    ...defaultTeriyakiSettings,
    persons: 30,
    vegetarians: 10,
    meatEaters: 10,
    chickenAvailable: 2000,
    flexTofuShare: 50
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
