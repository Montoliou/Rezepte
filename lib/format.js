const decimalFormatter = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 1
});

const integerFormatter = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0
});

export function formatNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits }).format(value);
}

export function formatInteger(value) {
  return integerFormatter.format(Math.round(value));
}

export function formatMass(grams) {
  if (grams >= 1000) {
    return `${formatNumber(grams / 1000, 2)} kg`;
  }
  return `${formatInteger(grams)} g`;
}

export function formatVolume(millilitres) {
  if (millilitres >= 1000) {
    return `${formatNumber(millilitres / 1000, 2)} l`;
  }
  return `${formatInteger(millilitres)} ml`;
}

export function formatSpoon(value, unit) {
  return `${decimalFormatter.format(value)} ${unit}`;
}

export function formatPiece(value, singular, plural = singular) {
  const rounded = Math.ceil(value);
  return `${formatInteger(rounded)} ${rounded === 1 ? singular : plural}`;
}

export function formatTime(minutes) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function timeToMinutes(value = "13:00") {
  const [hours = 13, minutes = 0] = String(value).split(":").map(Number);
  return (hours * 60) + minutes;
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours} Std. ${remaining} Min.` : `${hours} Std.`;
}
