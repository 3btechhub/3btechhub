export function watchColorScheme(onChange) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const update = () => onChange(query.matches ? "dark" : "light");
  update();
  query.addEventListener?.("change", update);
  return () => query.removeEventListener?.("change", update);
}