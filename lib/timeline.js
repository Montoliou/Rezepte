import { formatTime, timeToMinutes } from "./format.js";

export function buildTimeline({ finishTime, buffer = 0, tofuGrams, chickenGrams, prepScale = 1 }) {
  const finishMinutes = timeToMinutes(finishTime);
  const tofuBatches = tofuGrams > 0 ? Math.max(1, Math.ceil(tofuGrams / 600)) : 0;
  const chickenBatches = chickenGrams > 0 ? Math.max(1, Math.ceil(chickenGrams / 500)) : 0;
  const tofuCookMinutes = tofuBatches * 6;
  const chickenCookMinutes = chickenBatches * 8;
  const chickenOffset = 10 + chickenCookMinutes;
  const tofuOffset = chickenOffset + tofuCookMinutes;
  const riceSeasonOffset = Math.max(25, tofuOffset + 5);
  const riceCookOffset = riceSeasonOffset + 25;
  const riceWashOffset = riceCookOffset + 30;
  const prepExtra = Math.max(0, Math.ceil((prepScale - 1) * 10));
  const totalLead = Math.max(120 + prepExtra, riceWashOffset + 30) + buffer;

  const rawSteps = [
    {
      id: "start",
      offset: totalLead,
      duration: 15,
      title: "Vorbereitung starten",
      stage: "Vorbereitbar"
    },
    {
      id: "cold-prep",
      offset: totalLead - 15,
      duration: 20 + prepExtra,
      title: "Kalte Zutaten schneiden",
      stage: "Vorbereitbar"
    },
    {
      id: "rice-wash",
      offset: riceWashOffset,
      duration: 25,
      title: "Reis waschen und abtropfen",
      stage: "Vorbereitbar"
    },
    {
      id: "rice-cook",
      offset: riceCookOffset,
      duration: 25,
      title: "Reis kochen und ruhen lassen",
      stage: "Kurz vorher"
    },
    {
      id: "rice-season",
      offset: riceSeasonOffset,
      duration: 5,
      title: "Reis würzen",
      stage: "Kurz vorher"
    },
    ...(tofuGrams > 0 ? [{
      id: "tofu-cook",
      offset: tofuOffset,
      duration: tofuCookMinutes,
      title: `Tofu braten${tofuBatches > 1 ? ` · ${tofuBatches} Chargen` : ""}`,
      stage: "Kurz vorher"
    }] : []),
    ...(chickenGrams > 0 ? [{
      id: "chicken-cook",
      offset: chickenOffset,
      duration: chickenCookMinutes,
      title: `Hähnchen braten${chickenBatches > 1 ? ` · ${chickenBatches} Chargen` : ""}`,
      stage: "Direkt vor dem Servieren"
    }] : []),
    {
      id: "avocado",
      offset: 10,
      duration: 5,
      title: "Avocado schneiden",
      stage: "Direkt vor dem Servieren"
    },
    {
      id: "assemble",
      offset: 5,
      duration: 5,
      title: "Bowl-Bar aufstellen",
      stage: "Direkt vor dem Servieren"
    },
    {
      id: "serve",
      offset: 0,
      duration: 0,
      title: "Servieren",
      stage: "Servieren"
    }
  ];

  const steps = rawSteps
    .sort((a, b) => b.offset - a.offset)
    .map((step) => ({
      ...step,
      timeMinutes: finishMinutes - step.offset,
      time: formatTime(finishMinutes - step.offset)
    }));

  return {
    startTime: formatTime(finishMinutes - totalLead),
    totalLead,
    tofuBatches,
    chickenBatches,
    steps
  };
}
