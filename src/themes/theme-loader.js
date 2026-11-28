export async function loadTheme() {
  const variant = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  return { variant };
}
