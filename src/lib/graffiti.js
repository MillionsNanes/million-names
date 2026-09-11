// Shared allowlists: the browser, checkout API and public place use the same IDs.
export const PAINT_STYLES = [
  { id: "brush", label: "Brush" },
  { id: "wildstyle", label: "Bold graffiti" },
  { id: "handstyle", label: "Handwritten" },
  { id: "stencil", label: "Stencil" },
  { id: "bubble", label: "Spray paint" },
];

export const PAINT_COLOURS = [
  { id: "cyan", label: "Cyan", hex: "#40dff5" },
  { id: "purple", label: "Purple", hex: "#c799ff" },
  { id: "coral", label: "Coral", hex: "#ff8b80" },
  { id: "mint", label: "Mint", hex: "#93e7b3" },
  { id: "yellow", label: "Yellow", hex: "#ffcf55" },
  { id: "pink", label: "Pink", hex: "#ff91c6" },
];

export function isPaintStyle(value) {
  return typeof value === "string" && PAINT_STYLES.some((style) => style.id === value);
}

export function isPaintColour(value) {
  return typeof value === "string" && PAINT_COLOURS.some((colour) => colour.id === value);
}

// Legacy records keep their numbers and get a repeatable appearance, not random styling.
// Nulls also support pending checkouts made before this upgrade.
export function resolvePaint(style, colour, number) {
  const numeric = Number(number);
  const index = Number.isSafeInteger(numeric) && numeric > 0 ? numeric - 1 : 0;
  return {
    style: isPaintStyle(style) ? style : PAINT_STYLES[index % PAINT_STYLES.length].id,
    colour: isPaintColour(colour) ? colour : PAINT_COLOURS[index % PAINT_COLOURS.length].id,
  };
}

export function paintHex(colour) {
  return PAINT_COLOURS.find((item) => item.id === colour)?.hex || PAINT_COLOURS[0].hex;
}
