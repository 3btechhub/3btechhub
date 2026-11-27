export async function detectRegion() {
  // Precise GPS is intentionally not requested. Region detection requires an approved server-side source.
  return { region: "Unknown", source: "unavailable", confidence: null };
}