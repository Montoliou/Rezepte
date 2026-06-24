import assert from "node:assert/strict";
import test from "node:test";

import { formatMass, formatTime, timeToMinutes } from "../lib/format.js";
import { buildTimeline } from "../lib/timeline.js";

test("deutsche Mengenformatierung wechselt ab 1.000 g zu Kilogramm", () => {
  assert.equal(formatMass(640), "640 g");
  assert.equal(formatMass(1250), "1,25 kg");
});

test("Zeitformatierung funktioniert über Mitternacht", () => {
  assert.equal(timeToMinutes("00:15"), 15);
  assert.equal(formatTime(-15), "23:45");
});

test("Ablauf endet immer exakt zur Zielzeit und ist chronologisch", () => {
  const timeline = buildTimeline({
    finishTime: "13:00",
    buffer: 0,
    tofuGrams: 600,
    chickenGrams: 360,
    prepScale: 1
  });

  assert.equal(timeline.startTime, "11:00");
  assert.equal(timeline.steps.at(-1).time, "13:00");
  assert.equal(timeline.steps.at(-1).id, "serve");
  assert.ok(timeline.steps.every((step, index, steps) => (
    index === 0 || step.timeMinutes >= steps[index - 1].timeMinutes
  )));
});
