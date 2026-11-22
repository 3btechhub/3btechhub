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
  // Never attach a sticky generic verification error to the Login URL.
  accountLoginUrl.searchParams.delete("error");
  window.location.replace(accountLoginUrl.href);
}

function denySignedInUser() {
  window.location.replace(profileUrl.href);
}

async function verifyDashboardAccess() {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    if (!sessionData.session) {
      redirectToLogin();
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      await supabase.auth.signOut({ scope: "local" });
      redirectToLogin();
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .in("role", ["Owner", "Admin"])
      .limit(1)
      .maybeSingle();

    if (roleError) {
      console.error("Dashboard role lookup failed:", roleError);
      redirectToLogin();
      return;
    }

    if (!roleData) {
      denySignedInUser();
      return;
    }

    document.documentElement.dataset.privateAccess = "granted";
    document.dispatchEvent(new Event("private-access-granted"));
  } catch (error) {
    console.error("Dashboard session verification failed:", error);
    await supabase.auth.signOut({ scope: "local" });
    redirectToLogin();
  }
}

supabase.auth.onAuthStateChange(event => {
  if (event === "SIGNED_OUT") redirectToLogin();
});

verifyDashboardAccess();
