import { recipes, getRecipe } from "../recipes/index.js?v=2";
import { formatDuration } from "../lib/format.js?v=2";
import { loadState, saveState } from "../lib/storage.js?v=2";

const icons = {
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M20.8 4.1C14 3.5 8.5 5.1 6 8.8c-2.2 3.3-1 6.8 1.3 8.6 2.3 1.8 5.9 1.7 8.3-.9 2.7-3 3.6-7.2 5.2-12.4Z"/><path d="M4 21c2.1-4.2 5.4-7.7 10.2-10.3"/></svg>',
  bowl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M3 10h18c0 6-4 10-9 10S3 16 3 10Z"/><path d="M5 10c1-3 3.5-5 7-5s6 2 7 5M8 20h8"/></svg>',
  chicken: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M17 8c0 4-2.7 7-6 7s-6-3-6-7 2.7-6 6-6c1.5 0 2.7.6 3.7 1.5"/><path d="M11 15v5M8 20h6M18 5h.01"/><path d="M15 5h6l-2 3"/></svg>',
  cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 7 9 5v10l-9-5V7ZM21 7l-9 5v10l9-5V7Z"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>'
};

const elements = {
  siteHeader: document.getElementById("site-header"),
  brandButton: document.getElementById("brand-button"),
  recipesNav: document.getElementById("recipes-nav"),
  lastRecipeNav: document.getElementById("last-recipe-nav"),
  catalogScreen: document.getElementById("catalog-screen"),
  setupScreen: document.getElementById("setup-screen"),
  guideScreen: document.getElementById("guide-screen"),
  recipeList: document.getElementById("recipe-list"),
  setupBack: document.getElementById("setup-back"),
  setupForm: document.getElementById("setup-form"),
  persons: document.getElementById("persons"),
  personsOutput: document.getElementById("persons-output"),
  personsDecrease: document.getElementById("persons-decrease"),
  personsIncrease: document.getElementById("persons-increase"),
  finishTime: document.getElementById("finish-time"),
  buffer: document.getElementById("buffer"),
  chickenPortions: document.getElementById("chicken-portions"),
  chickenPerPerson: document.getElementById("chicken-per-person"),
  tofuPortions: document.getElementById("tofu-portions"),
  tofuPerPortion: document.getElementById("tofu-per-portion"),
  srirachaHeat: document.getElementById("sriracha-heat"),
  ricePerPerson: document.getElementById("rice-per-person"),
  avocadoFactor: document.getElementById("avocado-factor"),
  mangoFactor: document.getElementById("mango-factor"),
  edamameEnabled: document.getElementById("edamame-enabled"),
  proteinPortionsSummary: document.getElementById("protein-portions-summary"),
  proteinCoverageNote: document.getElementById("protein-coverage-note"),
  summaryList: document.getElementById("summary-list"),
  planningAdvisory: document.getElementById("planning-advisory"),
  logicNote: document.getElementById("logic-note"),
  ingredientsOnlyButton: document.getElementById("ingredients-only-button"),
  startGuideButton: document.getElementById("start-guide-button"),
  guideBack: document.getElementById("guide-back"),
  endPlanButton: document.getElementById("end-plan-button"),
  phaseButtons: [...document.querySelectorAll(".phase-button")],
  phasePanels: {
    ingredients: document.getElementById("ingredients-panel"),
    mise: document.getElementById("mise-panel"),
    cook: document.getElementById("cook-panel")
  },
  ingredientsSubtitle: document.getElementById("ingredients-subtitle"),
  shoppingGroups: document.getElementById("shopping-groups"),
  shoppingStatus: document.getElementById("shopping-status"),
  shareShoppingButton: document.getElementById("share-shopping-button"),
  copyShoppingButton: document.getElementById("copy-shopping-button"),
  resetShoppingButton: document.getElementById("reset-shopping-button"),
  ingredientGroups: document.getElementById("ingredient-groups"),
  copyButton: document.getElementById("copy-button"),
  printButton: document.getElementById("print-button"),
  nextPhaseButtons: [...document.querySelectorAll(".next-phase-button")],
  miseProgress: document.getElementById("mise-progress"),
  miseList: document.getElementById("mise-list"),
  currentStepTime: document.getElementById("current-step-time"),
  currentStepTitle: document.getElementById("cook-current-title"),
  currentStepInstruction: document.getElementById("current-step-instruction"),
  currentStepDetails: document.getElementById("current-step-details"),
  timer: document.getElementById("timer"),
  timerOutput: document.getElementById("timer-output"),
  timerToggle: document.getElementById("timer-toggle"),
  timerReset: document.getElementById("timer-reset"),
  completeStepButton: document.getElementById("complete-step-button"),
  parallelNote: document.getElementById("parallel-note"),
  finishTimeLabel: document.getElementById("finish-time-label"),
  timelineStartLabel: document.getElementById("timeline-start-label"),
  timelineList: document.getElementById("timeline-list"),
  nextStepPreview: document.getElementById("next-step-preview"),
  resetProgressButton: document.getElementById("reset-progress-button"),
  offlineStatus: document.getElementById("offline-status")
};

const storedState = loadState();
const initialRecipe = getRecipe(storedState?.recipeId);
const migratedStoredSettings = initialRecipe.migrateSettings
  ? initialRecipe.migrateSettings(storedState?.settings ?? {})
  : (storedState?.settings ?? {});
const state = {
  recipeId: initialRecipe.id,
  settings: {
    ...initialRecipe.defaults,
    ...migratedStoredSettings
  },
  screen: "catalog",
  phase: storedState?.phase ?? "ingredients",
  miseCompleted: Array.isArray(storedState?.miseCompleted) ? storedState.miseCompleted : [],
  cookCompleted: Array.isArray(storedState?.cookCompleted) ? storedState.cookCompleted : [],
  shoppingCompleted: Array.isArray(storedState?.shoppingCompleted) ? storedState.shoppingCompleted : [],
  selectedStepId: storedState?.selectedStepId ?? null,
  hasHistory: Boolean(storedState?.recipeId)
};

let result = initialRecipe.calculate(state.settings);
if (!result.valid) {
  state.settings = { ...initialRecipe.defaults };
  result = initialRecipe.calculate(state.settings);
}
let lastValidResult = result;
let timerInterval = null;
let timerRemaining = 0;
let timerRunning = false;
let timerStepId = null;
let timerEndAt = 0;
let wakeLock = null;

function persist() {
  saveState({
    recipeId: state.recipeId,
    settings: state.settings,
    phase: state.phase,
    miseCompleted: state.miseCompleted,
    cookCompleted: state.cookCompleted,
    shoppingCompleted: state.shoppingCompleted,
    selectedStepId: state.selectedStepId
  });
  state.hasHistory = true;
  updateLastRecipeButton();
}

function updateLastRecipeButton() {
  elements.lastRecipeNav.disabled = !state.hasHistory;
  elements.lastRecipeNav.setAttribute("aria-disabled", String(!state.hasHistory));
}

function showScreen(screen) {
  state.screen = screen;
  elements.catalogScreen.hidden = screen !== "catalog";
  elements.setupScreen.hidden = screen !== "setup";
  elements.guideScreen.hidden = screen !== "guide";
  elements.siteHeader.hidden = screen !== "catalog";
  elements.recipesNav.classList.toggle("is-active", screen === "catalog");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function recipeMeta(iconName, text) {
  return `<div class="recipe-meta-row">${icons[iconName]}<span>${text}</span></div>`;
}

function renderCatalog() {
  elements.recipeList.innerHTML = recipes.map((recipe) => `
    <article class="recipe-card">
      <div class="recipe-card-media">
        <img src="${recipe.image}" alt="Teriyaki Bowl mit Reis, Tofu, Hähnchen und frischen Toppings">
      </div>
      <div class="recipe-card-body">
        <h2>${recipe.name}</h2>
        <div class="recipe-meta">
          ${recipeMeta("clock", recipe.duration)}
          ${recipeMeta("users", recipe.servingRange)}
          ${recipeMeta("leaf", recipe.dietary)}
        </div>
        <button class="button button-primary recipe-open-button" type="button" data-recipe-id="${recipe.id}">
          Rezept öffnen
        </button>
      </div>
    </article>
  `).join("");
}

function syncFormFromSettings() {
  const settings = state.settings;
  elements.persons.value = settings.persons;
  elements.personsOutput.textContent = settings.persons;
  elements.finishTime.value = settings.finishTime;
  elements.buffer.value = settings.buffer;
  elements.chickenPortions.value = settings.chickenPortions;
  elements.chickenPerPerson.value = settings.chickenPerPerson;
  elements.tofuPortions.value = settings.tofuPortions;
  elements.tofuPerPortion.value = settings.tofuPerPortion;
  elements.srirachaHeat.value = settings.srirachaHeat;
  elements.ricePerPerson.value = settings.ricePerPerson;
  elements.avocadoFactor.value = settings.avocadoFactor;
  elements.mangoFactor.value = settings.mangoFactor;
  elements.edamameEnabled.checked = settings.edamameEnabled;
}

function readSettingsFromForm() {
  return {
    persons: Number(elements.persons.value),
    finishTime: elements.finishTime.value,
    buffer: Number(elements.buffer.value),
    chickenPortions: Number(elements.chickenPortions.value),
    chickenPerPerson: Number(elements.chickenPerPerson.value),
    tofuPortions: Number(elements.tofuPortions.value),
    tofuPerPortion: Number(elements.tofuPerPortion.value),
    srirachaHeat: Number(elements.srirachaHeat.value),
    ricePerPerson: Number(elements.ricePerPerson.value),
    avocadoFactor: Number(elements.avocadoFactor.value),
    mangoFactor: Number(elements.mangoFactor.value),
    edamameEnabled: elements.edamameEnabled.checked
  };
}

function summaryIcon(iconName) {
  return `<span class="summary-icon">${icons[iconName]}</span>`;
}

function renderSetupSummary(plan) {
  elements.summaryList.innerHTML = plan.summary.map((item) => `
    <div class="summary-row">
      ${summaryIcon(item.icon)}
      <div class="summary-copy">
        <span>${item.label}</span>
        <strong>${item.value}</strong>
      </div>
    </div>
  `).join("");

  elements.planningAdvisory.hidden = !plan.advisory;
  elements.planningAdvisory.innerHTML = plan.advisory
    ? `${icons.warning}<span>${plan.advisory}</span>`
    : "";
  elements.logicNote.textContent = plan.logicText;
}

function updateCalculation() {
  const recipe = getRecipe(state.recipeId);
  const nextSettings = readSettingsFromForm();
  if (JSON.stringify(nextSettings) !== JSON.stringify(state.settings)) {
    state.shoppingCompleted = [];
  }
  state.settings = nextSettings;
  result = recipe.calculate(state.settings);
  elements.personsOutput.textContent = state.settings.persons;
  elements.proteinPortionsSummary.textContent = `${result.plan.totalProteinPortions} Portionen`;
  elements.proteinCoverageNote.textContent = result.plan.advisory
    || "Die Proteinportionen entsprechen genau der Personenzahl.";
  elements.proteinCoverageNote.classList.toggle("is-warning", result.plan.proteinDifference !== 0);
  elements.ingredientsOnlyButton.disabled = !result.valid;
  elements.startGuideButton.disabled = !result.valid;

  if (result.valid) {
    lastValidResult = result;
    renderSetupSummary(result.plan);
    persist();
  }
}

function openRecipe(recipeId, target = "setup") {
  const recipe = getRecipe(recipeId);
  const switchingRecipe = state.recipeId !== recipe.id;
  state.recipeId = recipe.id;
  if (!state.hasHistory || switchingRecipe) {
    state.settings = { ...recipe.defaults };
    state.miseCompleted = [];
    state.cookCompleted = [];
    state.shoppingCompleted = [];
    state.selectedStepId = null;
  }
  syncFormFromSettings();
  updateCalculation();
  showScreen(target);
}

function setPhase(phase) {
  state.phase = phase;
  Object.entries(elements.phasePanels).forEach(([name, panel]) => {
    panel.hidden = name !== phase;
  });
  elements.phaseButtons.forEach((button) => {
    const isActive = button.dataset.phase === phase;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "step" : "false");
  });
  if (phase === "cook") renderCook();
  persist();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderIngredients(plan) {
  elements.ingredientsSubtitle.textContent = `Mengen für ${state.settings.persons} Personen.`;
  renderShopping(plan);
  elements.ingredientGroups.innerHTML = plan.ingredientGroups.map((group) => `
    <section class="ingredient-group">
      <h3>${group.title}</h3>
      ${group.description ? `<p class="ingredient-group-description">${group.description}</p>` : ""}
      <ul class="ingredient-list">
        ${group.items.map((item) => `
          <li class="ingredient-item">
            <span>${item.label}${item.note ? `<small>${item.note}</small>` : ""}</span>
            <strong>${item.value}</strong>
          </li>
        `).join("")}
      </ul>
    </section>
  `).join("");
}

function shoppingItems(plan) {
  return plan.shoppingGroups.flatMap((group) => group.items);
}

function updateShoppingStatus(plan, message = "") {
  const total = shoppingItems(plan).length;
  const completed = state.shoppingCompleted.length;
  elements.shoppingStatus.textContent = message || `${completed} von ${total} Positionen abgehakt.`;
}

function renderShopping(plan) {
  const validIds = new Set(shoppingItems(plan).map((item) => item.id));
  state.shoppingCompleted = state.shoppingCompleted.filter((id) => validIds.has(id));
  elements.shoppingGroups.innerHTML = plan.shoppingGroups.map((group) => `
    <section class="shopping-group">
      <h4>${group.title}</h4>
      <div class="shopping-list">
        ${group.items.map((item) => `
          <label class="shopping-item">
            <input type="checkbox" data-shopping-id="${item.id}" ${state.shoppingCompleted.includes(item.id) ? "checked" : ""}>
            <span>
              <strong>${item.value} ${item.label}</strong>
              ${item.note ? `<small>${item.note}</small>` : ""}
            </span>
          </label>
        `).join("")}
      </div>
    </section>
  `).join("");
  updateShoppingStatus(plan);
}

function renderMise(plan) {
  const validIds = new Set(plan.miseTasks.map((task) => task.id));
  state.miseCompleted = state.miseCompleted.filter((id) => validIds.has(id));
  elements.miseList.innerHTML = plan.miseTasks.map((task) => `
    <label class="check-item">
      <input type="checkbox" data-mise-id="${task.id}" ${state.miseCompleted.includes(task.id) ? "checked" : ""}>
      <span class="check-item-copy">
        <strong>${task.title}</strong>
        <span>${task.detail}</span>
      </span>
    </label>
  `).join("");
  updateMiseProgress(plan);
}

function updateMiseProgress(plan) {
  elements.miseProgress.textContent = `${state.miseCompleted.length} von ${plan.miseTasks.length} erledigt`;
}

function selectedCookStep(plan) {
  const validIds = new Set(plan.cookSteps.map((step) => step.id));
  state.cookCompleted = state.cookCompleted.filter((id) => validIds.has(id));

  if (!state.selectedStepId || !validIds.has(state.selectedStepId)) {
    state.selectedStepId = plan.cookSteps.find((step) => !state.cookCompleted.includes(step.id))?.id
      ?? plan.cookSteps.at(-1)?.id;
  }
  return plan.cookSteps.find((step) => step.id === state.selectedStepId) ?? plan.cookSteps[0];
}

function formatTimer(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function stopTimer({ releaseLock = true } = {}) {
  if (timerInterval) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;
  elements.timerToggle.textContent = timerRemaining <= 0 ? "Timer erneut starten" : "Timer starten";
  if (releaseLock && wakeLock) {
    wakeLock.release().catch(() => {});
    wakeLock = null;
  }
}

function updateTimerOutput() {
  elements.timerOutput.textContent = timerRemaining <= 0 ? "Fertig" : formatTimer(timerRemaining);
}

async function requestWakeLock() {
  if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
  } catch {
    wakeLock = null;
  }
}

function initializeTimer(step) {
  stopTimer();
  timerStepId = step.id;
  timerRemaining = step.timerMinutes * 60;
  timerEndAt = 0;
  updateTimerOutput();
  elements.timer.hidden = step.timerMinutes <= 0;
  elements.timerToggle.textContent = "Timer starten";
}

function startTimer() {
  if (timerRemaining <= 0) {
    const step = lastValidResult.plan.cookSteps.find((item) => item.id === timerStepId);
    timerRemaining = (step?.timerMinutes ?? 0) * 60;
  }
  timerRunning = true;
  timerEndAt = Date.now() + (timerRemaining * 1000);
  elements.timerToggle.textContent = "Timer pausieren";
  requestWakeLock();
  timerInterval = window.setInterval(() => {
    timerRemaining = Math.max(0, (timerEndAt - Date.now()) / 1000);
    updateTimerOutput();
    if (timerRemaining <= 0) {
      stopTimer();
      document.title = "Timer fertig · Montys Rezepte";
      window.setTimeout(() => {
        document.title = "Montys Rezepte";
      }, 5000);
    }
  }, 250);
}

function renderCurrentStep(plan, step) {
  elements.currentStepTime.textContent = `${step.time} Uhr · ${step.stage}`;
  elements.currentStepTitle.textContent = step.title;
  elements.currentStepInstruction.textContent = step.instruction;
  elements.currentStepDetails.innerHTML = step.details?.length
    ? `<ul>${step.details.map((detail) => `<li>${detail}</li>`).join("")}</ul>`
    : "";
  const isComplete = state.cookCompleted.includes(step.id);
  elements.completeStepButton.textContent = isComplete ? "Schritt wieder öffnen" : "Schritt erledigt";
  elements.completeStepButton.classList.toggle("button-primary", !isComplete);
  elements.completeStepButton.classList.toggle("button-secondary", isComplete);
  elements.parallelNote.hidden = !step.parallel;
  elements.parallelNote.textContent = step.parallel ?? "";

  if (timerStepId !== step.id) {
    initializeTimer(step);
  } else {
    elements.timer.hidden = step.timerMinutes <= 0;
    updateTimerOutput();
  }
}

function renderTimeline(plan, selectedStep) {
  elements.finishTimeLabel.textContent = `${state.settings.finishTime} Uhr`;
  elements.timelineStartLabel.textContent = `Empfohlener Start: ${plan.timeline.startTime} Uhr`;
  elements.timelineList.innerHTML = plan.cookSteps.map((step) => {
    const complete = state.cookCompleted.includes(step.id);
    const active = step.id === selectedStep.id;
    return `
      <button class="timeline-item${active ? " is-active" : ""}${complete ? " is-complete" : ""}"
        type="button" data-step-id="${step.id}" aria-current="${active ? "step" : "false"}">
        <span class="timeline-marker">${complete ? "✓" : ""}</span>
        <span class="timeline-time">${step.time}</span>
        <span class="timeline-title">${step.title}</span>
      </button>
    `;
  }).join("");

  const selectedIndex = plan.cookSteps.findIndex((step) => step.id === selectedStep.id);
  const next = plan.cookSteps.slice(selectedIndex + 1).find((step) => !state.cookCompleted.includes(step.id));
  elements.nextStepPreview.innerHTML = next
    ? `<strong>Als Nächstes:</strong> ${next.title} · ${formatDuration(next.timerMinutes)}`
    : "<strong>Plan vollständig.</strong> Alles ist servierbereit.";
}

function renderCook() {
  const plan = lastValidResult.plan;
  const step = selectedCookStep(plan);
  renderCurrentStep(plan, step);
  renderTimeline(plan, step);
  persist();
}

function renderGuide() {
  const plan = lastValidResult.plan;
  renderIngredients(plan);
  renderMise(plan);
  renderCook();
  setPhase(state.phase);
}

function beginGuide(startPhase = "ingredients") {
  if (!result.valid) return;
  lastValidResult = result;
  state.phase = startPhase;
  renderGuide();
  showScreen("guide");
  persist();
}

function createCopyText(plan) {
  const ingredientText = plan.ingredientGroups.flatMap((group) => [
    group.title,
    ...group.items.map((item) => `- ${item.label}: ${item.value}${item.note ? ` (${item.note})` : ""}`),
    ""
  ]);
  const miseText = plan.miseTasks.map((task, index) => `${index + 1}. ${task.title} – ${task.detail}`);
  const cookText = plan.cookSteps.map((step, index) => (
    `${index + 1}. ${step.time} Uhr: ${step.title} – ${step.instruction}`
  ));

  return [
    "Teriyaki Bowl",
    `${state.settings.persons} Personen · fertig um ${state.settings.finishTime} Uhr · Start um ${plan.timeline.startTime} Uhr`,
    "",
    "ZUTATEN",
    ...ingredientText,
    "MISE EN PLACE",
    ...miseText,
    "",
    "KOCHREIHENFOLGE",
    ...cookText
  ].join("\n");
}

function createShoppingText(plan) {
  return [
    `Einkaufsliste – Teriyaki Bowl für ${state.settings.persons} Personen`,
    "",
    ...plan.shoppingGroups.flatMap((group) => [
      group.title,
      ...group.items.map((item) => `- ${item.value} ${item.label}${item.note ? ` (${item.note})` : ""}`),
      ""
    ])
  ].join("\n").trim();
}

async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

async function copyPlan() {
  await writeClipboard(createCopyText(lastValidResult.plan));
  const original = elements.copyButton.textContent;
  elements.copyButton.textContent = "Kopiert";
  window.setTimeout(() => {
    elements.copyButton.textContent = original;
  }, 1400);
}

async function copyShoppingList() {
  await writeClipboard(createShoppingText(lastValidResult.plan));
  updateShoppingStatus(lastValidResult.plan, "Einkaufsliste kopiert.");
}

async function shareShoppingList() {
  const shareData = {
    title: "Einkaufsliste – Teriyaki Bowl",
    text: createShoppingText(lastValidResult.plan)
  };

  if (!navigator.share) {
    await copyShoppingList();
    updateShoppingStatus(
      lastValidResult.plan,
      "Teilen wird hier nicht unterstützt. Die Einkaufsliste wurde stattdessen kopiert."
    );
    return;
  }

  try {
    await navigator.share(shareData);
    updateShoppingStatus(lastValidResult.plan, "Einkaufsliste an das Share-Sheet übergeben.");
  } catch (error) {
    if (error?.name !== "AbortError") {
      await copyShoppingList();
      updateShoppingStatus(
        lastValidResult.plan,
        "Teilen war nicht möglich. Die Einkaufsliste wurde stattdessen kopiert."
      );
    }
  }
}

function endPlan() {
  const confirmed = window.confirm(
    "Aktuellen Kochfortschritt beenden? Deine Mengen-Einstellungen bleiben erhalten."
  );
  if (!confirmed) return;
  stopTimer();
  state.miseCompleted = [];
  state.cookCompleted = [];
  state.selectedStepId = null;
  state.phase = "ingredients";
  persist();
  showScreen("setup");
}

elements.recipeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-recipe-id]");
  if (button) openRecipe(button.dataset.recipeId);
});

elements.brandButton.addEventListener("click", () => showScreen("catalog"));
elements.recipesNav.addEventListener("click", () => showScreen("catalog"));
elements.lastRecipeNav.addEventListener("click", () => {
  if (!state.hasHistory) return;
  const recipe = getRecipe(state.recipeId);
  result = recipe.calculate(state.settings);
  if (!result.valid) {
    openRecipe(state.recipeId, "setup");
    return;
  }
  lastValidResult = result;
  renderGuide();
  showScreen("guide");
});
elements.setupBack.addEventListener("click", () => showScreen("catalog"));
elements.guideBack.addEventListener("click", () => {
  stopTimer();
  syncFormFromSettings();
  updateCalculation();
  showScreen("setup");
});

elements.personsDecrease.addEventListener("click", () => {
  elements.persons.value = Math.max(1, Number(elements.persons.value) - 1);
  updateCalculation();
});
elements.personsIncrease.addEventListener("click", () => {
  elements.persons.value = Math.min(30, Number(elements.persons.value) + 1);
  updateCalculation();
});
elements.setupForm.addEventListener("input", updateCalculation);
elements.setupForm.addEventListener("change", updateCalculation);
elements.ingredientsOnlyButton.addEventListener("click", () => beginGuide("ingredients"));
elements.startGuideButton.addEventListener("click", () => beginGuide("ingredients"));

elements.phaseButtons.forEach((button) => {
  button.addEventListener("click", () => setPhase(button.dataset.phase));
});
elements.nextPhaseButtons.forEach((button) => {
  button.addEventListener("click", () => setPhase(button.dataset.nextPhase));
});

elements.shoppingGroups.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-shopping-id]");
  if (!checkbox) return;
  const id = checkbox.dataset.shoppingId;
  state.shoppingCompleted = checkbox.checked
    ? [...new Set([...state.shoppingCompleted, id])]
    : state.shoppingCompleted.filter((item) => item !== id);
  updateShoppingStatus(lastValidResult.plan);
  persist();
});

elements.copyShoppingButton.addEventListener("click", copyShoppingList);
elements.shareShoppingButton.addEventListener("click", shareShoppingList);
elements.resetShoppingButton.addEventListener("click", () => {
  state.shoppingCompleted = [];
  renderShopping(lastValidResult.plan);
  persist();
});

elements.miseList.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-mise-id]");
  if (!checkbox) return;
  const id = checkbox.dataset.miseId;
  state.miseCompleted = checkbox.checked
    ? [...new Set([...state.miseCompleted, id])]
    : state.miseCompleted.filter((item) => item !== id);
  updateMiseProgress(lastValidResult.plan);
  persist();
});

elements.timelineList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-step-id]");
  if (!button) return;
  state.selectedStepId = button.dataset.stepId;
  renderCook();
});

elements.completeStepButton.addEventListener("click", () => {
  const plan = lastValidResult.plan;
  const currentId = state.selectedStepId;
  const alreadyComplete = state.cookCompleted.includes(currentId);
  state.cookCompleted = alreadyComplete
    ? state.cookCompleted.filter((id) => id !== currentId)
    : [...new Set([...state.cookCompleted, currentId])];

  if (!alreadyComplete) {
    const currentIndex = plan.cookSteps.findIndex((step) => step.id === currentId);
    state.selectedStepId = plan.cookSteps
      .slice(currentIndex + 1)
      .find((step) => !state.cookCompleted.includes(step.id))?.id ?? currentId;
  }
  stopTimer();
  timerStepId = null;
  renderCook();
});

elements.timerToggle.addEventListener("click", () => {
  if (timerRunning) {
    timerRemaining = Math.max(0, (timerEndAt - Date.now()) / 1000);
    stopTimer();
    updateTimerOutput();
  } else {
    startTimer();
  }
});

elements.timerReset.addEventListener("click", () => {
  const step = lastValidResult.plan.cookSteps.find((item) => item.id === timerStepId);
  stopTimer();
  timerRemaining = (step?.timerMinutes ?? 0) * 60;
  updateTimerOutput();
});

elements.resetProgressButton.addEventListener("click", () => {
  const confirmed = window.confirm("Alle abgehakten Kochschritte zurücksetzen?");
  if (!confirmed) return;
  state.cookCompleted = [];
  state.selectedStepId = lastValidResult.plan.cookSteps[0]?.id ?? null;
  stopTimer();
  timerStepId = null;
  renderCook();
});

elements.endPlanButton.addEventListener("click", endPlan);
elements.copyButton.addEventListener("click", copyPlan);
elements.printButton.addEventListener("click", () => window.print());

window.addEventListener("online", () => {
  elements.offlineStatus.hidden = true;
});
window.addEventListener("offline", () => {
  elements.offlineStatus.hidden = false;
});
document.addEventListener("visibilitychange", () => {
  if (timerRunning && document.visibilityState === "visible") requestWakeLock();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js?v=2").catch(() => {
      // Kernfunktionen bleiben ohne Service Worker vollständig nutzbar.
    });
  });
}

renderCatalog();
syncFormFromSettings();
renderSetupSummary(lastValidResult.plan);
updateLastRecipeButton();
showScreen("catalog");
