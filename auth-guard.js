import { supabase } from "./supabase-client.js";
import { canSeeTarget } from "./visibility/rbv.js";

const html = document.documentElement;
const permission = html.dataset.pagePermission;
const pageKey = html.dataset.pageRbvKey || "dashboard";
const rootUrl = new URL("./", import.meta.url);

function revealAuthorizedPage() {
  html.classList.remove("rbv-pending", "auth-pending");
}

function goToLogin() {
  const loginUrl = new URL("login/", rootUrl);
  loginUrl.searchParams.set(
    "next",
    location.pathname + location.search + location.hash
  );
  location.replace(loginUrl.href);
}

function goToHome() {
  location.replace(new URL("home/", rootUrl).href);
}

async function protectPage() {
  // The root page always redirects to Home; this rule does not affect Dashboard.
  if (pageKey === "root") {
    goToHome();
    return;
  }

  if (!permission || !pageKey) return;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    goToLogin();
    return;
  }

  const [visible, permissionResult] = await Promise.all([
    canSeeTarget("page", pageKey),
    supabase.rpc("can_access_page", { permission_slug: permission })
  ]);

  if (!visible) {
    goToHome();
    return;
  }

  if (permissionResult.error || permissionResult.data !== true) {
    console.error("Supabase page permission check failed.", permissionResult.error);
    goToHome();
    return;
  }

  revealAuthorizedPage();
}

protectPage().catch(error => {
  console.error("Supabase Auth/RBV page authorization failed.", error);
  goToHome();
});
