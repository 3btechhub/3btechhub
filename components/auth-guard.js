import { supabase } from "./supabase-client.js";
import { canSeeTarget } from "./rbv.js";

const permission = document.documentElement.dataset.pagePermission;
const rootUrl = new URL("../", import.meta.url);

function showPage() {
  document.documentElement.classList.remove("auth-pending");
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
  location.replace(rootUrl.href);
}

async function protectPage() {
  if (!permission) {
    goToHome();
    return;
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    goToLogin();
    return;
  }

  const visible = await canSeeTarget("page", "dashboard");
  if (!visible) {
    goToHome();
    return;
  }

  const { data: allowed, error: permissionError } = await supabase.rpc(
    "can_access_page",
    { permission_slug: permission }
  );

  if (permissionError || allowed !== true) {
    console.error("Page access check failed.", permissionError);
    goToHome();
    return;
  }

  showPage();
}

protectPage().catch(error => {
  console.error("Authentication check failed.", error);
  goToHome();
});
