import { supabase } from "./supabase-client.js";

const authScript = Array.from(document.scripts).find(script =>
  script.src.includes("/component/dashboard-auth.js")
);
const siteRoot = authScript
  ? new URL("../", authScript.src)
  : new URL("/", window.location.href);

const accountLoginUrl = new URL("account/login/", siteRoot);
accountLoginUrl.searchParams.set("next", "dashboard");
const profileUrl = new URL("account/profile/", siteRoot);
profileUrl.searchParams.set("access", "denied");

function redirectToLogin() {
  window.location.replace(accountLoginUrl.href);
}

function denySignedInUser() {
  window.location.replace(profileUrl.href);
}

async function verifyDashboardAccess() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      redirectToLogin();
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "Owner")
      .maybeSingle();

    if (roleError || !roleData) {
      denySignedInUser();
      return;
    }

    document.documentElement.dataset.privateAccess = "granted";
    document.dispatchEvent(new Event("private-access-granted"));
  } catch {
    denySignedInUser();
  }
}

supabase.auth.onAuthStateChange(event => {
  if (event === "SIGNED_OUT") redirectToLogin();
});

verifyDashboardAccess();
