export const FOUNDING_LIMIT = 50;

export function isFounding50(value) {
  if (typeof value !== "number" && !(typeof value === "string" && /^\d+$/.test(value))) return false;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 1 && number <= FOUNDING_LIMIT;
}

export function foundingProgress(confirmedCount) {
  if (!Number.isSafeInteger(confirmedCount) || confirmedCount < 0) return null;
  const claimed = Math.min(confirmedCount, FOUNDING_LIMIT);
  return { claimed, remaining: FOUNDING_LIMIT - claimed, complete: claimed === FOUNDING_LIMIT };
}
