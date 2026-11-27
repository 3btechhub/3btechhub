export async function loadTheme() {
  // Theme tokens are loaded by the global stylesheet before application content renders.
  return { family: "Classic", variants: ["light", "dark"] };
}