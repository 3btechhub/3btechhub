import { canSeeTarget } from "./rbv.js";

const html = document.documentElement;
const pageKey = html.dataset.pageRbvKey;

async function authorizePage() {
  if (!pageKey) return;

  const authorized = await canSeeTarget("page", pageKey);
  if (authorized) {
    html.classList.remove("rbv-pending");
    return;
  }

  // Keep the page covered when Supabase does not authorize this role.
  html.classList.add("rbv-denied");
}

authorizePage().catch(error => {
  console.error("Supabase page RBV authorization failed.", error);
  html.classList.add("rbv-denied");
});
